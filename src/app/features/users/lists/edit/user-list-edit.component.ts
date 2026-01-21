import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListRcpUpsertRequestEntity, ListItemRcpUpsertRequestEntity } from 'src/app/shared/entity/rcp/list.rcp.entity';
import { ProductSelectorDialogComponent } from './product-selector-dialog/product-selector-dialog.component';
import { Product } from 'src/app/core/models/products/product.model';
import { ListItemTrackingTypeEnum } from 'src/app/shared/entity/list.entity';
import { UserSimpleSelectorDialogComponent } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';

@Component({
  selector: 'app-user-list-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: './user-list-edit.component.html',
  styleUrl: './user-list-edit.component.scss'
})
export class UserListEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private listService = inject(UserListService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private loggerService = inject(LoggerService);

  readonly listId = computed(() => this.route.snapshot.paramMap.get('id'));
  readonly redirectTo = computed(() => this.route.snapshot.queryParamMap.get('redirectTo') || '');
  readonly isEdit = computed(() => !!this.listId());
  readonly readonlyMode = computed(() => this.redirectTo().length > 0);

  listForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: ['custom'],
    is_private: [true]
  });

  // Local state for items
  items = signal<any[]>([]);
  showUserSelector = true; // Use a flag as requested
  selectedOwner = signal<any>(null);
  initialState = signal<any>(null);

  hasChanges = computed(() => {
    const initial = this.initialState();
    if (!initial) return false;

    const currentForm = this.listForm.value;
    const currentOwnerId = this.selectedOwner()?.id;
    const currentItems = this.items().map(i => ({
      product_id: i.product_id,
      target_price: i.target_price,
      tracking_type: i.tracking_type
    }));

    const formChanged = JSON.stringify(currentForm) !== JSON.stringify(initial.form);
    const ownerChanged = currentOwnerId !== initial.ownerId;
    const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(initial.items);

    return formChanged || ownerChanged || itemsChanged;
  });

  listDataResource = rxResource({
    stream: () => this.listService.getById(this.listId() || '')
  });

  listItemsResource = rxResource({
    stream: () => this.listService.getAllItemsComplete(this.listId() || '')
  });

  constructor() {
    effect(() => {
      const id = this.listId();
      this.listDataResource.reload();
      this.listItemsResource.reload();
    });

    effect(() => {
      if (this.readonlyMode()) {
        this.listForm.disable({ emitEvent: false });
      } else {
        this.listForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const list = this.listDataResource.value() as any;
      const items = this.listItemsResource.value() as any[];
      const allUsers = this.userService.users();
      const currentUser = this.userService.currentUser();

      if (this.isEdit()) {
        if (list && allUsers.length > 0 && items) {
          this.listForm.patchValue({
            name: list.name,
            description: list.description,
            slug: list.slug as any,
            is_private: list.is_private
          }, { emitEvent: false });

          const owner = allUsers.find(u => u.id === list.owner_id);
          if (owner) {
            this.selectedOwner.set(owner);
          }

          if (!this.initialState()) {
            this.initialState.set({
              form: this.listForm.value,
              ownerId: list.owner_id,
              items: items.map(i => ({
                product_id: i.product_id,
                target_price: i.target_price,
                tracking_type: i.tracking_type
              }))
            });
          }
        }
      } else {
        // Create mode
        if (currentUser && !this.selectedOwner()) {
          this.selectedOwner.set(currentUser);
          
          if (!this.initialState()) {
            this.initialState.set({
              form: this.listForm.value,
              ownerId: currentUser.id,
              items: []
            });
          }
        }
      }
    });

    effect(() => {
      const items = this.listItemsResource.value() as any[];
      if (items && Array.isArray(items)) {
        this.items.set([...items]);
      }
    });
  }

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto', filterable: true },
    ],
    searchableFields: ['product_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: false,
      edit: false,
      delete: true
    }
  };

  onAddProduct() {
    const dialogRef = this.dialog.open(ProductSelectorDialogComponent, {
      width: '1000px',
      data: { 
        existingIds: this.items().map(i => i.product_id) 
      }
    });

    dialogRef.afterClosed().subscribe((result: { added: Product[], removedIds: number[] }) => {
      if (result) {
        let updatedItems = [...this.items()];

        // 1. Process Removals
        if (result.removedIds.length > 0) {
          updatedItems = updatedItems.filter(item => !result.removedIds.includes(item.product_id));
        }

        // 2. Process Additions
        if (result.added.length > 0) {
          const newItems = result.added
            .filter(product => !updatedItems.find(i => i.product_id === product.id))
            .map((product: any) => ({ // Added 'any' here to address potential linting for product type
              product_id: product.id,
              product_name: product.name,
              product_main_image: product.media?.find((m: any) => m.is_main)?.url || 'assets/images/placeholder.png',
              target_price: product.pricing?.sale_price || 0,
              tracking_type: ListItemTrackingTypeEnum.none
            }));
          updatedItems = [...updatedItems, ...newItems];
        }

        if (result.added.length > 0 || result.removedIds.length > 0) {
          this.items.set(updatedItems);
          const msg = `${result.added.length} añadidos, ${result.removedIds.length} quitados`;
          this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  onDeleteProduct(item: any) {
    this.items.update(prev => prev.filter(i => i.product_id !== item.product_id));
  }

  onChangeOwner() {
    if (!this.showUserSelector) return;

    const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
      width: '500px',
      data: {
        initialSelectedId: this.selectedOwner()?.id
      }
    });

    dialogRef.afterClosed().subscribe((user: UserDashboardModel) => {
      if (user) {
        this.selectedOwner.set(user);
      }
    });
  }

  onSave() {
    if (this.listForm.invalid) {
      this.listForm.markAllAsTouched();
      return;
    }

    const formValue = this.listForm.value;
    const owner = this.selectedOwner();

    if (!owner && !this.isEdit()) {
      this.snackBar.open('Propietario no definido', 'Cerrar', { duration: 3000 });
      return;
    }

    const payload: ListRcpUpsertRequestEntity = {
      p_list_id: this.listId() || undefined,
      p_owner_id: owner?.id,
      p_name: formValue.name || '',
      p_description: formValue.description || '',
      p_slug: (formValue.slug as any) || 'custom',
      p_is_private: formValue.is_private || false,
      p_products: this.items().map(i => ({
        product_id: i.product_id,
        target_price: i.target_price,
        tracking_type: i.tracking_type
      }))
    };

    this.listService.upsert(payload).subscribe({
      next: (count) => {
        if (count !== null) {
          this.snackBar.open('Lista guardada correctamente', 'Cerrar', { duration: 3000 });
          this.goBack();
        } else {
          this.snackBar.open('Error al guardar la lista: No se recibió confirmación', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err: any) => {
        this.loggerService.error('Error saving list', err, UserListEditComponent.name, 'onSave');
        this.snackBar.open('Error al guardar la lista', 'Cerrar', { duration: 3000 });
      }
    });
  }

  goBack() {
    const redirectToUrl = this.redirectTo().length > 0 ? this.redirectTo() : '/users/lists';
    this.router.navigate([redirectToUrl]);
  }
}
