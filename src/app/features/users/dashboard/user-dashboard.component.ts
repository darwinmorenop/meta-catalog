import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services & Models
import { UserService } from 'src/app/core/services/users/user.service';
import { UserDashboardModel, UserRankLabel } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserDialogComponent } from 'src/app/features/users/dialog/user-dialog.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SmartTableComponent,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: 'user-dashboard.component.html',
  styleUrl: 'user-dashboard.component.scss'
})
export class UserDashboardComponent {
  private readonly userService = inject(UserService);
  private readonly loggerService = inject(LoggerService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly CLASS_NAME = UserDashboardComponent.name;

  usersResource = rxResource({
    stream: () => this.userService.getAllDashboard()
  });

  // --- Signals Derivados (Computed) ---

  totalUsers = computed(() => this.usersResource.value()?.length ?? 0);
  
  manualUsers = computed(() => {
    const users = this.usersResource.value() ?? [];
    return users.filter(u => u.isManual).length;
  });

  tableData = computed(() => {
    const users = this.usersResource.value() ?? [];
    return users.map(u => ({
      ...u,
      rankName: UserRankLabel[u.rank] || u.rank,
      fullName: `${u.firstName} ${u.lastName || ''}`,
      Responsable: u.sponsor ? `${u.sponsor?.firstName} ${u.sponsor?.lastName || ''}` : 'N/A',
      sponsorName: u.sponsor ? `${u.sponsor?.firstName} ${u.sponsor?.lastName || ''} (${UserRankLabel[u.sponsor.rank] || u.sponsor.rank})` : 'N/A'
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'image', header: 'Foto', type: 'image' },
      { key: 'fullName', header: 'Nombre Completo', filterable: false },
      { key: 'email', header: 'Email', filterable: false },
      { key: 'rankName', header: 'Rango', filterable: true },
      { key: 'sponsorName', header: 'Responsable', filterable: true },
    ],
    searchableFields: ['fullName', 'Responsable', 'email', 'rankName'],
    actions: {
      show: true,
      edit: true,
      delete: true,
      view: true
    },
    pageSizeOptions: [10, 20, 50]
  };

  onEdit(user: UserDashboardModel): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.update(result).subscribe(() => {
          this.usersResource.reload();
        });
      }
    });
  }

  onDelete(user: UserDashboardModel): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.firstName}?`)) {
      this.userService.delete(user.id).subscribe(() => {
        this.usersResource.reload();
      });
    }
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { user: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.insert(result).subscribe(() => {
          this.usersResource.reload();
        });
      }
    });
  }

  onView(user: UserDashboardModel): void {
    const context = `onView`;
    this.loggerService.debug(`Routing to user detail: ${user.id}`,this.CLASS_NAME,context);
    this.router.navigate(['/users', user.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
