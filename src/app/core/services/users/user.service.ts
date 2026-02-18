import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserDaoSupabaseService } from 'src/app/core/services/users/dao/user.dao.supabase.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserDashboardModel, UserRankEnum } from 'src/app/core/models/users/user.model';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';
import { UserProfileService } from 'src/app/core/services/users/user.profile.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userDaoSupabaseService = inject(UserDaoSupabaseService);
  private userProfileService = inject(UserProfileService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

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

  // Loading state
  isInitialized = signal(false);

  constructor() {
    this.loadAll();

    // Sincronizar con Supabase Auth
    effect(() => {
      const authUser = this.authService.user();
      if (authUser) {
        // this.logger.debug(`Usuario autenticado detectado: ${authUser.id}`, 'UserService');
        this.getUserDetailWithNetwork(authUser.id).subscribe(network => {
          this.currentUserNetwork.set(network);
          localStorage.setItem(this.ACTIVE_USER_KEY, authUser.id);
        });
      } else {
        // Si no hay sesión, intentamos cargar el último usuario guardado (comportamiento legacy/dev)
        const savedId = localStorage.getItem(this.ACTIVE_USER_KEY);
        if (savedId && !this.currentUserNetwork()) {
           this.getUserDetailWithNetwork(savedId).subscribe(network => {
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
    this.getAllDashboard().subscribe(users => {
      this.users.set(users);
      
      const savedId = localStorage.getItem(this.ACTIVE_USER_KEY);
      if (savedId) {
        this.getUserDetailWithNetwork(savedId).subscribe({
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
        this.isInitialized.set(true);
      },
      error: (err) => {
        console.error('Error loading user profile permissions', err);
        this.currentUserProfile.set(null);
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

    this.getUserDetailWithNetwork(user.id).subscribe(network => {
      this.currentUserNetwork.set(network);
      localStorage.setItem(this.ACTIVE_USER_KEY, user.id);
    });
  }

  getAllDashboard(): Observable<UserDashboardModel[]> {
    return this.userDaoSupabaseService.getAll().pipe(
      map((users: UserEntity[]) => users.map((user: UserEntity) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        isManual: user.isManual,
        identifier: user.identifier,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank as UserRankEnum,
        sponsor: user.sponsorId ? this.convertToUserDashboardModel(users.find((u: UserEntity) => u.id === user.sponsorId)) : null,
        image: user.image,
        user_profile_id: user.user_profile_id,
        settings: user.settings
      })))
    );
  }

  getUserDetailWithNetwork(userId: string): Observable<UserNetworkDetail[]> {
    return this.userDaoSupabaseService.getUserDetailWithNetwork(userId);
  }

  private convertToUserDashboardModel(user: UserEntity | undefined): UserDashboardModel | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isManual: user.isManual,
      identifier: user.identifier,
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank as UserRankEnum,
      sponsor: null, // To avoid infinite loop
      image: user.image,
      user_profile_id: user.user_profile_id,
      settings: user.settings
    };
  }

  getAvailableSponsors(editingUserId: string): Observable<UserSponsorEntity[]> {
    return this.userDaoSupabaseService.getAvailableSponsorsRpc(editingUserId);
  }

  insert(user: UserEntity): Observable<UserEntity> {
    return this.userDaoSupabaseService.insert(user);
  }

  update(user: UserEntity): Observable<UserEntity> {
    return this.userDaoSupabaseService.update(user);
  }

  delete(id: string): Observable<boolean> {
    return this.userDaoSupabaseService.delete(id);
  }

  findByPhoneOrEmail(phone?: string, email?: string): Observable<Partial<UserEntity> | null> {
    return this.userDaoSupabaseService.findByPhoneOrEmail(phone, email);
  }

}
