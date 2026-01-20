import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';

@Component({
  selector: 'app-user-search-existing-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'user-search-existing-dialog.component.html',
  styleUrl: 'user-search-existing-dialog.component.scss'
})
export class UserSearchExistingDialogComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserSearchExistingDialogComponent>);

  searchForm: FormGroup = this.fb.group({
    phone: ['', [Validators.pattern(/^\+\d{1,4}\d{6,14}$/)]], // Prefix + number
    email: ['', [Validators.email]]
  }, { validators: this.atLeastOneFieldValidator });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  atLeastOneFieldValidator(group: FormGroup) {
    const phone = group.get('phone')?.value;
    const email = group.get('email')?.value;
    return (phone || email) ? null : { atLeastOneField: true };
  }

  onSearch() {
    if (this.searchForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { phone, email } = this.searchForm.value;

    this.userService.findByPhoneOrEmail(phone, email).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user) {
          this.dialogRef.close(user);
        } else {
          this.errorMessage.set('No se encontró ningún usuario con esos datos.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Ocurrió un error al buscar al usuario.');
        console.error(err);
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
