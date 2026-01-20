import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { UserAgendaService } from 'src/app/core/services/users/user.agenda.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserAgendaDashboardEntity } from 'src/app/shared/entity/view/user.agenda.dashboard.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserAgendaDialogComponent } from '../dialog/user-agenda-dialog.component';

export type AgendaScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-user-agenda-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: 'user-agenda-dashboard.component.html',
  styleUrl: 'user-agenda-dashboard.component.scss'
})
export class UserAgendaDashboardComponent {
  private router = inject(Router);
  private agendaService = inject(UserAgendaService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  scopeControl = new FormControl<AgendaScopeType>('Personal', { nonNullable: true });
  scope = toSignal(this.scopeControl.valueChanges, { initialValue: this.scopeControl.value });

  filteredUserIds = computed(() => {
    const scope = this.scope();
    const currentUser = this.userService.currentUser();
    const network = this.userService.currentUserNetwork() || [];

    if (!currentUser) return [];

    switch (scope) {
      case 'Personal':
        return [currentUser.id];
      case 'Grupal':
        return network.map((u: UserNetworkDetail) => u.id);
      case 'Todos':
        return [];
      default:
        return [];
    }
  });

  agendaResource = rxResource({
    stream: () => this.agendaService.getAll(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.agendaResource.reload();
    });
  }

  tableData = computed(() => {
    const raw = this.agendaResource.value() || [];
    return raw.map(item => ({
      ...item,
      fullName: `${item.first_name} ${item.last_name || ''}`,
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'image', header: 'Foto', type: 'image' },
      { key: 'fullName', header: 'Contacto', filterable: true },
      { key: 'alias', header: 'Alias', filterable: true },
      { key: 'phone', header: 'Teléfono', filterable: true },
      { key: 'email', header: 'Email', filterable: true },
      { key: 'last_contact_at', header: 'Últ. Contacto', type: 'datetime', filterable: false },
      { key: 'created_at', header: 'Desde', type: 'datetime', filterable: false },
    ],
    searchableFields: ['fullName', 'alias', 'email', 'phone'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  onViewContact(item: UserAgendaDashboardEntity) {
    this.dialog.open(UserAgendaDialogComponent, {
      width: '800px',
      data: { contact: item, mode: 'view' }
    });
  }

  onEditContact(item: UserAgendaDashboardEntity) {
    const dialogRef = this.dialog.open(UserAgendaDialogComponent, {
      width: '800px',
      data: { contact: item, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.agendaResource.reload();
      }
    });
  }

  onDeleteContact(item: UserAgendaDashboardEntity) {
    console.log(item);
    if (confirm(`¿Estás seguro de desvincular a ${item.first_name} de tu agenda?`)) {
      this.agendaService.unlink(item.owner_id, item.contact_id).subscribe({
        next: () => {
          this.snackBar.open('Contacto desvinculado', 'Cerrar', { duration: 3000 });
          this.agendaResource.reload();
        },
        error: (err) => {
          this.snackBar.open('Error al desvincular contacto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onAddContact() {
    const dialogRef = this.dialog.open(UserAgendaDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.agendaResource.reload();
      }
    });
  }
}
