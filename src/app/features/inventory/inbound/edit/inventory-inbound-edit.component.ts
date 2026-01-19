import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { InventoryInboundStatusEnum, InventoryInboundEntity, InventoryInboundStatusLabels } from 'src/app/shared/entity/inventory.inbound.entity';
import { UserSimpleSelectorDialogComponent, UserSimpleSelectorData } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';
import { UserService } from 'src/app/core/services/users/user.service';
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { StockEntryEditDialogComponent, StockEntryEditDialogData } from 'src/app/features/products/inventory/stock-entry/dialog/edit-dialog/stock-entry-edit-dialog.component';
import { ProductInventoryStockEntryEntity } from 'src/app/shared/entity/product.inventory.stock-entry.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Component({
  selector: 'app-inventory-inbound-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    SmartTableComponent
  ],
  templateUrl: 'inventory-inbound-edit.component.html',
  styleUrl: 'inventory-inbound-edit.component.scss'
})
export class InventoryInboundEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private inboundService = inject(InventoryInboundService);
  private stockService = inject(ProductInventoryStockEntryService);
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private dateUtils = inject(DateUtilsService);

  id = signal<number | null>(null);
  form: FormGroup;
  statusOptions = computed(() => {
    const currentStatus = this.headerInfo()?.inbound_status;
    return Object.values(InventoryInboundStatusEnum)
      .filter(status => {
        if (currentStatus === InventoryInboundStatusEnum.deleted) {
          return true;
        }
        return status !== InventoryInboundStatusEnum.deleted;
      })
      .map(status => ({ value: status, label: InventoryInboundStatusLabels[status] }));
  });

  selectedSourceUser = signal<any>(null);
  selectedTargetUser = signal<any>(null);

  inboundResource = rxResource({
    stream: () => {
      const id = this.id();
      if (!id) return of([]);
      return this.inboundService.getInboundByIdDetailedDashboardData(id);
    }
  });

  headerInfo = computed(() => {
    const data = this.inboundResource.value();
    if (!data || data.length === 0) return null;
    return data[0];
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_sku', header: 'SKU' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'quantity', header: 'Cant.' },
      { key: 'unit_cost', header: 'Costo Unit.', type: 'currency' },
      { key: 'line_total_cost', header: 'Monto Total', type: 'currency' },
      { key: 'batch_number', header: 'Lote' },
      { key: 'expiry_date', header: 'Vence', type: 'date' }
    ],
    searchableFields: ['product_name', 'product_sku'],
    pageSizeOptions: [10, 20],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  tableData = computed(() => {
    const data = this.inboundResource.value();
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      ...item,
      smart_table_delete_disabled: item.inbound_status === InventoryInboundStatusEnum.deleted,
      smart_table_edit_disabled: item.inbound_status === InventoryInboundStatusEnum.deleted
    }));
  });

  constructor() {
    this.form = this.fb.group({
      reference_number: ['', Validators.required],
      status: ['', Validators.required],
      received_at: ['', Validators.required],
      user_source_id: ['', Validators.required],
      description: ['', Validators.required],
      user_target_id: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const numId = Number(idParam);
      this.id.set(numId);
      
      this.inboundService.getInboundByIdDetailedDashboardData(numId).subscribe(data => {
        if (data && data.length > 0) {
          const inbound = data[0];
          this.form.patchValue({
            reference_number: inbound.reference_number,
            status: inbound.inbound_status,
            received_at: this.dateUtils.formatDateForInput(inbound.received_at),
            user_source_id: inbound.source_user_id,
            description: inbound.inbound_description,
            user_target_id: inbound.target_user_id
          });
          
          this.selectedSourceUser.set({
            id: inbound.source_user_id,
            firstName: inbound.source_user_full_name, // Simplified since we only have full name
            email: inbound.source_user_email
          });
          this.selectedTargetUser.set({
            id: inbound.target_user_id,
            firstName: inbound.target_user_full_name,
            email: inbound.target_user_email
          });
        }
      });
    }
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

  onSave() {
    if (this.form.invalid) return;

    const id = this.id();
    if (!id) return;

    this.inboundService.update(id, this.form.value).subscribe(success => {
      if (success) {
        this.snackBar.open('Cabecera del Inbound actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.inboundResource.reload();
      }
    });
  }

  onViewDetail(item: any) {
    this.snackBar.open('En el futuro cruzar informacion de precios en el momento que se creó el stock', 'Entendido', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  onEditDetail(item: any) {
    const dataEntry: StockEntryEditDialogData = {
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
      description: item.description
    };
    const dialogRef = this.dialog.open(StockEntryEditDialogComponent, {
      width: '600px',
      data: dataEntry
    });

    dialogRef.afterClosed().subscribe((result: StockEntryEditDialogData) => {
      if (result) {
        const updateData: Partial<ProductInventoryStockEntryEntity> = {
          id: item.entry_id,
          quantity: result.quantity,
          unit_cost: result.unit_cost,
          batch_number: result.batch_number,
          expiry_date: result.expiry_date,
          description: result.description
        };
        this.stockService.update(updateData).subscribe(success => {
          if (success) {
            this.inboundResource.reload();
          }
        });
      }
    });
  }

  onDeleteDetail(item: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de entrada?')) {
      const insertData: Partial<ProductInventoryStockEntryEntity> = {
        product_id: item.product_id,
        quantity: item.quantity * -1,
        unit_cost: item.unit_cost,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        user_owner_id: item.target_user_id,
        inbound_id: item.inbound_id,
        description: `Eliminación de stock físico: ${item.entry_id}`,
      };
      this.stockService.insert(insertData).subscribe(success => {
        if (success) {
          this.inboundResource.reload();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/inventory/inbound']);
  }
}
