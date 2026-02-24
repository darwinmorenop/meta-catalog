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
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public router = inject(Router);
  private snackBar = inject(MatSnackBar);

  resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = signal(false);
  hidePassword = signal(true);

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading.set(true);
    const { password } = this.resetForm.value;

    this.authService.updatePassword(password).subscribe({
      next: (response) => {
        if (response.error) {
          this.snackBar.open(response.error.message, 'Cerrar', { duration: 5000 });
        } else {
          this.snackBar.open('Contraseña actualizada con éxito. Ya puedes iniciar sesión.', 'Cerrar', { duration: 5000 });
          this.router.navigate(['/login']);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('Error al actualizar la contraseña', 'Cerrar', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }
}
