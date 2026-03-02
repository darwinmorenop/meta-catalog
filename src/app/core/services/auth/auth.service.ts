import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseAuthService } from 'src/app/core/services/admin/supabase/supabase.auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseAuthService = inject(SupabaseAuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = 'AuthService';

  session = signal<Session | null>(null);
  user = signal<User | null>(null);
  isInitialized = signal(false);

  constructor() {
    this.logger.debug('Initializing AuthService', this.CLASS_NAME);
    // Initializing state
    this.supabaseAuthService.getSession().subscribe(
      ({ data: { session } }) => {
        this.logger.debug('Initial session check completed', this.CLASS_NAME);
        this.handleAuthChange('SIGNED_IN' as any, session);
        this.isInitialized.set(true);
      },
      (err) => {
        this.logger.error('Error getting initial session', this.CLASS_NAME, err);
        this.isInitialized.set(true); // Still initialized, just no session
      });

    // Listening for auth changes
    this.supabaseAuthService.onAuthStateChange((event, session) => {
      this.handleAuthChange(event, session);
    });
  }

  private handleAuthChange(event: AuthChangeEvent, session: Session | null) {
    this.logger.debug(`Auth event: ${event}`, this.CLASS_NAME);
    this.session.set(session);
    this.user.set(session?.user ?? null);

    if (event === 'SIGNED_OUT') {
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated = computed(() => !!this.user());
}
