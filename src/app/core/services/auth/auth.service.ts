import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { Router } from '@angular/router';
import { from, Observable, tap } from 'rxjs';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService).getSupabaseClient();
  private router = inject(Router);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = 'AuthService';

  session = signal<Session | null>(null);
  user = signal<User | null>(null);

  constructor() {
    // Initializing state
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.handleAuthChange('SIGNED_IN', session);
    });

    // Listening for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
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

  signIn(email: string): Observable<any> {
    // Magic link is often preferred, but user might want password. 
    // Usually a "Magic Link" is standard for premium Supabase setups.
    return from(this.supabase.auth.signInWithOtp({ email }));
  }

  signInWithPassword(email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signInWithPassword({ email, password }));
  }

  signUp(email: string, password: string, data: any): Observable<any> {
    return from(this.supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: data // Contiene first_name, last_name, etc. que el trigger capturará
      }
    }));
  }

  signInWithOAuth(provider: 'google' | 'facebook' | 'apple'): Observable<any> {
    return from(this.supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    }));
  }

  resetPassword(email: string): Observable<any> {
    return from(this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }));
  }

  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut());
  }

  get isAuthenticated(): boolean {
    return !!this.user();
  }
}
