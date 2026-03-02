import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/admin/supabase/supabase.service';
import { Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseAuthService {
    private supabase = inject(SupabaseService).getSupabaseClient();
    private logger = inject(LoggerService);
    private readonly CLASS_NAME = SupabaseAuthService.name;

    constructor() {
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

    updatePassword(password: string): Observable<any> {
        return from(this.supabase.auth.updateUser({ password }));
    }

    signOut(): Observable<any> {
        return from(this.supabase.auth.signOut());
    }

    getSession(): Observable<any> {
        return from(this.supabase.auth.getSession());
    }

    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): Observable<any> {
        const { data: subscription } = this.supabase.auth.onAuthStateChange(callback);
        return of(subscription);
    }

    getCurrentUser(): Observable<any> {
        return from(this.supabase.auth.getUser());
    }
}
