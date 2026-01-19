import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserService } from 'src/app/core/services/users/user.service';
import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { InventoryInboundStatusEnum, InventoryInboundStatusLabels } from 'src/app/shared/entity/inventory.inbound.entity';
import { InventoryInboundInsertRcpEntity } from 'src/app/shared/entity/rcp/inventory.inbound.rcp.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { UserSimpleSelectorDialogComponent, UserSimpleSelectorData } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';
import { StockEntryCreateEditWithoutProductDialogComponent, StockEntryCreateEditWithoutProductDialogData } from './stock-entry-create-edit-witouth-product/stock-entry-create-edit-without-product-dialog.component';

@Component({
  selector: 'app-inventory-inbound-register',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SmartTableComponent
  ],
  templateUrl: 'inventory-inbound-register.component.html',
  styleUrl: 'inventory-inbound-register.component.scss'
})
export class InventoryInboundRegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private inboundService = inject(InventoryInboundService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = InventoryInboundRegisterComponent.name;

  form: FormGroup;
  statusOptions = Object.values(InventoryInboundStatusEnum)
    .filter(status => status !== InventoryInboundStatusEnum.deleted)
    .map(status => ({ key: status, value: InventoryInboundStatusLabels[status] }));

  // Track selected user objects for UI display
  selectedSourceUser = signal<UserDashboardModel | null>(null);
  selectedTargetUser = signal<UserDashboardModel | null>(null);

  // List of added products
  productsList = signal<any[]>([]);

  // Users for source/target selection
  users = this.userService.users;

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_image', header: 'Imagen', type: 'image' },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'quantity', header: 'Cantidad' },
      { key: 'unit_cost', header: 'Costo Unit.', type: 'currency' },
      { key: 'batch_number', header: 'Lote' },
      { key: 'expiry_date', header: 'Vence' }
    ],
    searchableFields: ['product_name', 'product_sku'],
    actions: {
      show: true,
      edit: true,
      delete: true
    },
    pageSizeOptions: [10, 20]
  };

  constructor() {
    const currentUser = this.userService.currentUser() as any;
    this.selectedTargetUser.set(currentUser);

    this.form = this.fb.group({
      user_source_id: ['', Validators.required],
      user_target_id: [currentUser?.id || '', Validators.required],
      received_at: [new Date(), Validators.required],
      reference_number: ['', Validators.required],
      status: [InventoryInboundStatusEnum.pending, Validators.required],
      description: ['', Validators.required]
    });
  }

  selectSourceUser() {
    const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
      width: '600px',
      data: { initialSelectedId: this.selectedSourceUser()?.id } as UserSimpleSelectorData
    });

    dialogRef.afterClosed().subscribe(user => {
      if (user) {
        this.selectedSourceUser.set(user);
        this.form.patchValue({ user_source_id: user.id });
      }
    });
  }

  selectTargetUser() {
    const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
      width: '600px',
      data: { initialSelectedId: this.selectedTargetUser()?.id } as UserSimpleSelectorData
    });

    dialogRef.afterClosed().subscribe(user => {
      if (user) {
        this.selectedTargetUser.set(user);
        this.form.patchValue({ user_target_id: user.id });
      }
    });
  }

  addProduct() {
    const dataInput: StockEntryCreateEditWithoutProductDialogData = { isEdit: false };
    const dialogRef = this.dialog.open(StockEntryCreateEditWithoutProductDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: dataInput
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productsList.update(list => [...list, result]);
      }
    });
  }

  onEditProduct(product: any) {
    const dataInput: StockEntryCreateEditWithoutProductDialogData = { product, isEdit: true };
    const index = this.productsList().indexOf(product);
    const dialogRef = this.dialog.open(StockEntryCreateEditWithoutProductDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: dataInput
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productsList.update(list => {
          const newList = [...list];
          newList[index] = result;
          return newList;
        });
      }
    });
  }

  onDeleteProduct(product: any) {
    this.productsList.update(list => list.filter(p => p !== product));
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.productsList().length === 0) {
      this.logger.error('No products added', this.CLASS_NAME, 'save');
      // Show alert or snackbar? User didn't ask but it's good practice.
      return;
    }

    const val = this.form.value;
    const payload: InventoryInboundInsertRcpEntity = {
      user_source_id: val.user_source_id,
      user_target_id: val.user_target_id,
      received_at: val.received_at.toISOString(),
      reference_number: val.reference_number,
      status: val.status,
      products: this.productsList().map(p => ({
        product_id: p.product_id,
        quantity: p.quantity,
        unit_cost: p.unit_cost,
        batch_number: p.batch_number,
        expiry_date: p.expiry_date
      }))
    };

    this.inboundService.registerInbound(payload).subscribe({
      next: (res) => {
        this.logger.log('Inbound registered successfully', res, this.CLASS_NAME);
        this.router.navigate(['/inventory/inbound']);
      },
      error: (err) => {
        this.logger.error('Error registering inbound', err, this.CLASS_NAME);
      }
    });
  }

  cancel() {
    this.router.navigate(['/inventory/inbound']);
  }
}
