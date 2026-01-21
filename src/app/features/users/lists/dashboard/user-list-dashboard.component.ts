import { Component, inject, computed, effect, signal } from '@angular/core';
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

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListEntity } from 'src/app/shared/entity/list.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ListCopyDialogComponent } from './dialog/list-copy-dialog.component';
import { ListRcpCopyRequestEntity } from 'src/app/shared/entity/rcp/list.rcp.entity';
import { ListViewEntity } from 'src/app/shared/entity/view/list.view.entity';

export type ListScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-user-list-dashboard',
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
  templateUrl: './user-list-dashboard.component.html',
  styleUrl: './user-list-dashboard.component.scss'
})
export class UserListDashboardComponent {
  private router = inject(Router);
  private listService = inject(UserListService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  scopeControl = new FormControl<ListScopeType>('Personal', { nonNullable: true });
  scope = toSignal(this.scopeControl.valueChanges, { initialValue: this.scopeControl.value });
  selectedList = signal<ListEntity | null>(null);

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

  listResource = rxResource({
    stream: () => this.listService.getAll(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.listResource.reload();
    });
  }

  tableData = computed(() => {
    return this.listResource.value()?.map((l: ListViewEntity) => ({
      ...l,
      smart_table_view_disabled: l.items_count === 0
    })) ?? [];
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'description', header: 'Descripción', filterable: true },
      { key: 'is_private', header: 'Privada', type: 'boolean', filterable: true },
      { key: 'created_at', header: 'Creada el', type: 'datetime', filterable: false },
      { key: 'updated_at', header: 'Actualizada el', type: 'datetime', filterable: false },
    ],
    searchableFields: ['name', 'description'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  onViewList(item: any) {
    const showName = this.scope() !== 'Personal';
    this.router.navigate(['/users/lists', item.id], {
      queryParams: showName ? { showName: 'true' } : {}
    });
  }

  onEditList(item: ListEntity) {
    this.router.navigate(['/users/lists', item.id, 'edit']);
  }

  onDeleteList(item: ListEntity) {
    if (confirm(`¿Estás seguro de eliminar la lista "${item.name}"?`)) {
      this.listService.delete(item.id).subscribe({
        next: () => {
          this.snackBar.open('Lista eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.listResource.reload();
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar la lista', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onSelect(item: ListEntity) {
    this.selectedList.set(item);
  }

  onCopyList() {
    const list = this.selectedList();
    const currentUser = this.userService.currentUser();
    if (!list || !currentUser) return;

    const dialogRef = this.dialog.open(ListCopyDialogComponent, {
      width: '400px',
      data: { oldName: list.name }
    });

    dialogRef.afterClosed().subscribe(newName => {
      if (newName) {
        const payload: ListRcpCopyRequestEntity = {
          p_source_list_id: list.id,
          p_new_owner_id: currentUser.id,
          p_new_name: newName
        };

        this.listService.copy(payload).subscribe({
          next: (newListId) => {
            if (newListId) {
              this.snackBar.open('Lista copiada correctamente', 'Ver', { duration: 5000 })
                .onAction().subscribe(() => {
                  this.router.navigate(['/users/lists', newListId]);
                });
              this.listResource.reload();
              this.selectedList.set(null);
            }
          },
          error: (err) => {
            this.snackBar.open('Error al copiar la lista', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  onAddList() {
    this.router.navigate(['/users/lists/create']);
  }
}
