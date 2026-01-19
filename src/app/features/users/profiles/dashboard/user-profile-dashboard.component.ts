import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfileService } from 'src/app/core/services/users/user.profile.service';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { UserProfileDialogComponent } from '../dialog/user-profile-dialog.component';

@Component({
  selector: 'app-user-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    SmartTableComponent
  ],
  templateUrl: './user-profile-dashboard.component.html',
  styleUrl: './user-profile-dashboard.component.scss'
})
export class UserProfileDashboardComponent implements OnInit {
  private readonly profileService = inject(UserProfileService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly logger = inject(LoggerService);
  private readonly CLASS_NAME = UserProfileDashboardComponent.name;

  profiles = signal<UserProfile[]>([]);
  isLoading = signal(false);

  tableConfig: TableConfig = {
    columns: [
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'description', header: 'Descripción', filterable: true },
      { key: 'created_at', header: 'Creado', type: 'date', filterable: false },
    ],
    searchableFields: ['name', 'description'],
    pageSizeOptions: [5, 10, 25, 50],
    actions: {
      show: true,
      edit: true,
      delete: true,
      view: true
    }
  };

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.isLoading.set(true);
    this.profileService.getAll().subscribe({
      next: (data) => {
        this.profiles.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.logger.error('Error loading profiles', this.CLASS_NAME, 'loadProfiles', err);
        this.isLoading.set(false);
      }
    });
  }

  viewProfile(profile: UserProfile) {
    this.dialog.open(UserProfileDialogComponent, {
      width: '800px',
      data: { profile, mode: 'view' }
    });
  }

  addProfile() {
    const dialogRef = this.dialog.open(UserProfileDialogComponent, {
      width: '800px',
      data: { profile: null, mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProfiles();
    });
  }

  editProfile(profile: UserProfile) {
    const dialogRef = this.dialog.open(UserProfileDialogComponent, {
      width: '800px',
      data: { profile, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProfiles();
    });
  }

  deleteProfile(profile: UserProfile) {
    if (confirm(`¿Estás seguro de eliminar el perfil "${profile.name}"?`)) {
      this.profileService.delete(profile.id).subscribe({
        next: () => {
          this.snackBar.open('Perfil eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadProfiles();
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar el perfil', 'Cerrar', { duration: 3000 });
          this.logger.error('Error deleting profile', this.CLASS_NAME, 'deleteProfile', err);
        }
      });
    }
  }
}
