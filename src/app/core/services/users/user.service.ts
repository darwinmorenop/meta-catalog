import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserDaoSupabaseService } from 'src/app/core/services/users/dao/user.dao.supabase.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserDashboardModel, UserRankEnum } from 'src/app/core/models/users/user.model';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserProfile, ProfileSlug } from 'src/app/shared/entity/user.profile.entity';
import { UserProfileService } from 'src/app/core/services/admin/users/profile/user.profile.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SupabaseService } from 'src/app/core/services/admin/supabase/supabase.service';
import { UserReadService } from 'src/app/core/services/admin/users/main/read/user-read.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userReadService = inject(UserReadService);
  private userProfileService = inject(UserProfileService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);

  private readonly ACTIVE_USER_KEY = 'activeUserId';
  
  // All users cached for selection and finding active user
  users = signal<UserDashboardModel[]>([]);
  
  // The full network of the currently active user
  currentUserNetwork = signal<UserNetworkDetail[] | null>(null);
  
  // The root user of the current network (the active user itself)
  currentUser = computed(() => {
    const network = this.currentUserNetwork();
    if (!network || network.length === 0) return null;
    // The RPC returns relative_level 0 for the root user
    return network.find(u => u.relativeLevel === 0) || network[0];
  });

  // The permissions profile of the current user
  currentUserProfile = signal<UserProfile | null>(null);

  // All available profiles for simulation
  availableProfiles = signal<UserProfile[]>([]);

  // The original profile slug (before any simulation)
  originalProfileSlug = signal<ProfileSlug | null>(null);

  // Loading state
  isInitialized = signal(false);

  constructor() {
    this.loadAll();

    // Sincronizar con Supabase Auth
    effect(() => {
      const authUser = this.authService.user();
      if (authUser) {
        // this.logger.debug(`Usuario autenticado detectado: ${authUser.id}`, 'UserService');
        this.userReadService.getUserDetailWithNetwork(authUser.id).subscribe(network => {
          this.currentUserNetwork.set(network);
          localStorage.setItem(this.ACTIVE_USER_KEY, authUser.id);
        });
      } else {
        // Si no hay sesión, intentamos cargar el último usuario guardado (comportamiento legacy/dev)
        const savedId = localStorage.getItem(this.ACTIVE_USER_KEY);
        if (savedId && !this.currentUserNetwork()) {
           this.userReadService.getUserDetailWithNetwork(savedId).subscribe(network => {
            this.currentUserNetwork.set(network);
          });
        }
      }
    });

    // Effect to apply user theme settings
    effect(() => {
      const user = this.currentUser();
      if (user && user.settings) {
        this.themeService.setTheme(user.settings.theme);
      }

      // Load permissions when user changes
      if (user && user.user_profile_id) {
        this.loadUserProfile(user.user_profile_id);
      } else {
        this.currentUserProfile.set(null);
        if (user) {
          // If we have a user but no profile, we are technically "initialized" with no permissions
          this.isInitialized.set(true);
        }
      }
    });
  }

  loadAll() {
    // Load all available profiles for simulation
    this.userProfileService.getAll().subscribe(profiles => {
      this.availableProfiles.set(profiles);
    });

    this.userReadService.getAllDashboard().subscribe(users => {
      this.users.set(users);
      
      const savedId = localStorage.getItem(this.ACTIVE_USER_KEY);
      if (savedId) {
        this.userReadService.getUserDetailWithNetwork(savedId).subscribe({
          next: (network) => {
            this.currentUserNetwork.set(network);
            // The effect will trigger loadUserProfile, which will set isInitialized to true
          },
          error: () => {
             this.isInitialized.set(true);
          }
        });
      } else {
        this.isInitialized.set(true);
      }
    });
  }

  private loadUserProfile(profileId: string) {
    this.userProfileService.getById(profileId).subscribe({
      next: (profile) => {
        this.currentUserProfile.set(profile);
        this.originalProfileSlug.set(profile.slug as ProfileSlug);
        this.supabaseService.setSchema(profile.slug);
        this.isInitialized.set(true);
      },
      error: (err) => {
        console.error('Error loading user profile permissions', err);
        this.currentUserProfile.set(null);
        this.originalProfileSlug.set(null);
        this.isInitialized.set(true);
      }
    });
  }

  setCurrentUser(user: UserDashboardModel | null) {
    if (!user) {
      this.currentUserNetwork.set(null);
      localStorage.removeItem(this.ACTIVE_USER_KEY);
      return;
    }

    this.userReadService.getUserDetailWithNetwork(user.id).subscribe(network => {
      this.currentUserNetwork.set(network);
      localStorage.setItem(this.ACTIVE_USER_KEY, user.id);
    });
  }

  simulateProfileSlug(slug: ProfileSlug) {
    const profiles = this.availableProfiles();
    const targetProfile = profiles.find(p => p.slug === slug);
    
    if (!targetProfile) {
      console.warn(`Profile with slug ${slug} not found`);
      return;
    }

    // Actualizamos el perfil completo para simular permisos reales
    this.currentUserProfile.set(targetProfile);
    this.supabaseService.setSchema(targetProfile.slug);
  }

}
