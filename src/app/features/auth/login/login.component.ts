import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstName: [''],
    lastName: ['']
  });

  isLoading = signal(false);
  hidePassword = signal(true);
  isLoginMode = signal(true);
  isForgotPasswordMode = signal(false);

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.isForgotPasswordMode.set(false);
    if (this.isLoginMode()) {
      this.loginForm.get('firstName')?.clearValidators();
      this.loginForm.get('lastName')?.clearValidators();
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.loginForm.get('firstName')?.setValidators([Validators.required]);
      this.loginForm.get('lastName')?.setValidators([Validators.required]);
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.loginForm.get('firstName')?.updateValueAndValidity();
    this.loginForm.get('lastName')?.updateValueAndValidity();
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  toggleForgotPassword() {
    this.isForgotPasswordMode.set(!this.isForgotPasswordMode());
    if (this.isForgotPasswordMode()) {
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.loginForm.get('email')?.invalid) return;
    if (!this.isForgotPasswordMode() && this.loginForm.get('password')?.invalid) return;

    this.isLoading.set(true);
    const { email, password, firstName, lastName } = this.loginForm.value;

    if (this.isForgotPasswordMode()) {
      this.authService.resetPassword(email).subscribe({
        next: (response) => {
          if (response.error) {
            this.snackBar.open(response.error.message, 'Cerrar', { duration: 5000 });
          } else {
            this.snackBar.open('Email de recuperación enviado. Revisa tu bandeja.', 'Cerrar', { duration: 5000 });
            this.isForgotPasswordMode.set(false);
          }
          this.isLoading.set(false);
        },
        error: (err) => this.handleError(err)
      });
      return;
    }

    if (this.isLoginMode()) {
      this.authService.signInWithPassword(email, password).subscribe({
        next: (response) => this.handleAuthResponse(response),
        error: (err) => this.handleError(err)
      });
    } else {
      this.authService.signUp(email, password, { first_name: firstName, last_name: lastName }).subscribe({
        next: (response) => this.handleAuthResponse(response, true),
        error: (err) => this.handleError(err)
      });
    }
  }

  async signInWithOAuth(provider: 'google' | 'facebook' | 'apple') {
    this.authService.signInWithOAuth(provider).subscribe({
      error: (err) => this.handleError(err)
    });
  }

  private handleAuthResponse(response: any, isSignUp = false) {
    if (response.error) {
      this.snackBar.open(response.error.message, 'Cerrar', { duration: 5000 });
    } else {
      const msg = isSignUp ? '¡Registro completado! Revisa tu email.' : '¡Sesión iniciada!';
      this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      if (!isSignUp) this.router.navigate(['/']);
    }
    this.isLoading.set(false);
  }

  private handleError(err: any) {
    this.snackBar.open('Error al conectar con el servidor', 'Cerrar', { duration: 5000 });
    this.isLoading.set(false);
  }
}
