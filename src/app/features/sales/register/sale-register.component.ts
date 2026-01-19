import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserService } from 'src/app/core/services/users/user.service';
import { SaleService } from 'src/app/core/services/sales/sale.service';
import { SaleInsertRcpEntity } from 'src/app/shared/entity/rcp/sale.rcp.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { UserSimpleSelectorDialogComponent, UserSimpleSelectorData } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';
import { SaleProductDialogComponent } from './sale-product-dialog/sale-product-dialog.component';
import { SalePaymentMethod, SalePaymentMethodLabels, SaleStatus, SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';

@Component({
  selector: 'app-sale-register',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    SmartTableComponent
  ],
  templateUrl: 'sale-register.component.html',
  styleUrl: 'sale-register.component.scss'
})
export class SaleRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private saleService = inject(SaleService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = SaleRegisterComponent.name;

  isEdit = false;
  saleId: number | null = null;
  form!: FormGroup;

  statusOptions = Object.values(SaleStatus).map(s => ({ key: s, value: SaleStatusLabels[s] }));
  paymentOptions = Object.values(SalePaymentMethod).map(p => ({ key: p, value: SalePaymentMethodLabels[p] }));

  selectedSeller = signal<Partial<UserNetworkDetail> | null>(null);
  selectedBuyer = signal<Partial<UserNetworkDetail> | null>(null);
  itemsList = signal<SaleDetailedEntity[]>([]);
  
  private originalSaleStatus: SaleStatus | null = null;
  private originalItems = signal<SaleDetailedEntity[]>([]);

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_image', header: 'Imagen', type: 'image' },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'quantity', header: 'Cant.' },
      { key: 'unit_price', header: 'Precio Unit.', type: 'currency' },
      { key: 'discount_amount', header: 'Dcto.', type: 'currency' },
      { key: 'line_revenue', header: 'Total', type: 'currency' }
    ],
    searchableFields: ['product_name', 'product_sku'],
    actions: { show: true, edit: true, delete: true },
    pageSizeOptions: [10, 20]
  };

  grandTotal = computed(() => {
    return this.itemsList().reduce((acc, curr) => acc + curr.line_revenue, 0);
  });

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  private initForm() {
    const currentUser = this.userService.currentUser() as UserNetworkDetail;
    this.selectedSeller.set(currentUser);

    this.form = this.fb.group({
      user_seller_id: [currentUser?.id || '', Validators.required],
      user_buyer_id: ['', Validators.required],
      payment_method: [SalePaymentMethod.cash, Validators.required],
      status: [SaleStatus.started, Validators.required],
      description: ['', Validators.required]
    });
  }

  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.saleId = Number(idParam);
      this.loadSaleData(this.saleId);
    }
  }

  private loadSaleData(id: number) {
    this.saleService.getSaleByIdDetailedData(id).subscribe(data => {
      if (data && data.length > 0) {
        const first = data[0];
        this.form.patchValue({
          user_seller_id: first.source_user_id,
          user_buyer_id: first.target_user_id,
          payment_method: first.payment_method,
          status: first.sale_status,
          description: first.sale_description
        });

        this.selectedSeller.set({ id: first.source_user_id, firstName: first.source_user_name });
        this.selectedBuyer.set({ id: first.target_user_id, firstName: first.target_user_name });

        this.originalSaleStatus = first.sale_status;

        const mappedItems = data.map(item => ({
          ...item,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          line_revenue: item.line_revenue,
          smart_table_edit_disabled: item.sale_status === SaleStatus.cancelled || item.sale_status === SaleStatus.refunded,
          smart_table_delete_disabled: item.sale_status === SaleStatus.cancelled || item.sale_status === SaleStatus.refunded
        }));

        this.itemsList.set(mappedItems);
        this.originalItems.set([...mappedItems]);
      }
    });
  }

  selectUser(type: 'seller' | 'buyer') {
    const initialId = type === 'seller' ? this.selectedSeller()?.id : this.selectedBuyer()?.id;
    const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
      width: '600px',
      data: { initialSelectedId: initialId } as UserSimpleSelectorData
    });

    dialogRef.afterClosed().subscribe(user => {
      if (user) {
        if (type === 'seller') {
          this.selectedSeller.set(user);
          this.form.patchValue({ user_seller_id: user.id });
        } else {
          this.selectedBuyer.set(user);
          this.form.patchValue({ user_buyer_id: user.id });
        }
      }
    });
  }

  addItem() {
    const dialogRef = this.dialog.open(SaleProductDialogComponent, {
      width: '1000px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const processed = this.applyItemNegationLogic(result);
        this.itemsList.update(list => [...list, processed]);
      }
    });
  }

  private applyItemNegationLogic(item: any): SaleDetailedEntity {
    // Si el item ya existe en DB (item_id) y su estado es cancelado o reembolsado, negamos valores para el balance
    if (item.item_id && (item.item_status === SaleStatus.cancelled || item.item_status === SaleStatus.refunded)) {
      return {
        ...item,
        quantity: -Math.abs(item.quantity),
        line_revenue: -Math.abs(item.line_revenue || 0),
        discount_amount: -Math.abs(item.discount_amount || 0),
        smart_table_edit_disabled: true,
        smart_table_delete_disabled: true
      };
    }
    return item;
  }

  onEditItem(item: any) {
    const index = this.itemsList().indexOf(item);
    const dialogRef = this.dialog.open(SaleProductDialogComponent, {
      width: '1000px',
      data: { product: item, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemsList.update(list => {
          const newList = [...list];
          newList[index] = this.applyItemNegationLogic(result);
          return newList;
        });
      }
    });
  }

  onDeleteItem(item: SaleDetailedEntity) {
    if (!this.isEdit || !item.item_id) {
      // Si es una venta nueva o un item que acabamos de añadir (sin ID de base de datos)
      this.itemsList.update(list => list.filter(i => i !== item));
    } else {
      // Si es un item que ya existe en la base de datos, lo "anulamos" usando la lógica de negación
      this.itemsList.update(list => {
        return list.map(i => i === item ? this.applyItemNegationLogic({
          ...i,
          item_status: SaleStatus.cancelled
        }) : i);
      });
    }
  }

  save() {
    if (this.form.invalid || (this.itemsList().length === 0 && !this.isEdit)) {
      this.snackBar.open('Por favor completa los datos y añade al menos un producto', 'Cerrar', { duration: 3000 });
      return;
    }

    const val = this.form.value;
    const currentStatus = val.status;
    const isNowCancelled = currentStatus === SaleStatus.cancelled || currentStatus === SaleStatus.refunded;
    const wasAlreadyCancelled = this.originalSaleStatus === SaleStatus.cancelled || this.originalSaleStatus === SaleStatus.refunded;

    let itemsToSave: any[];
    let finalTotal: number;

    // LÓGICA DE CANCELACIÓN GLOBAL:
    // Si la venta se está cancelando/reembolsando ahora y antes no lo estaba,
    // ignoramos cualquier cambio ad-hoc y mandamos los items originales negados.
    if (this.isEdit && isNowCancelled && !wasAlreadyCancelled) {
      itemsToSave = this.originalItems().map(i => ({
        id: i.item_id,
        product_id: i.product_id,
        quantity: -Math.abs(i.quantity),
        unit_price: i.unit_price,
        discount_amount: -Math.abs(i.discount_amount || 0),
        unit_cost_at_sale: i.unit_cost_at_sale,
        status: currentStatus,
        description: `Borrada venta: ${this.saleId}`
      }));
      // Calculamos el total de la reversión
      finalTotal = itemsToSave.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price - curr.discount_amount), 0);
    } else {
      // Flujo estándar: guardamos lo que haya actualmente en la lista de items
      itemsToSave = this.itemsList().map(i => ({
        id: i.item_id || undefined,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount_amount: i.discount_amount,
        unit_cost_at_sale: i.unit_cost_at_sale,
        status: i.item_status || currentStatus,
        description: i.item_description
      }));
      finalTotal = this.grandTotal();
    }

    const payload: SaleInsertRcpEntity = {
      id: this.saleId,
      user_source_id: val.user_seller_id,
      user_target_id: val.user_buyer_id,
      payment_method: val.payment_method,
      description: val.description,
      status: currentStatus,
      items: itemsToSave,
      total_amount: finalTotal,
    };

    this.saleService.saveSale(payload).subscribe({
      next: () => {
        this.snackBar.open('Venta guardada correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/sales', this.saleId]);
      },
      error: (err) => this.logger.error('Error guardando venta', err, this.CLASS_NAME)
    });
  }

  cancel() {
    this.router.navigate(['/sales']);
  }
}
