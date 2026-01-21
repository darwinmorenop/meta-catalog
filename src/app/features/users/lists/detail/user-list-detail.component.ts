import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListItemViewEntity } from 'src/app/shared/entity/view/list.view.entity';

@Component({
  selector: 'app-user-list-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: './user-list-detail.component.html',
  styleUrl: './user-list-detail.component.scss'
})
export class UserListDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listService = inject(UserListService);
  private snackBar = inject(MatSnackBar);

  readonly listId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly showName = computed(() => this.route.snapshot.queryParamMap.get('showName') === 'true');
  readonly redirectTo = computed(() => this.route.snapshot.queryParamMap.get('redirectTo') || '');

  itemsResource = rxResource({
    stream: () => this.listService.getAllItems(this.listId())
  });

  ownerName = computed(() => {
    const items = this.itemsResource.value() as any[];
    return (items && items.length > 0) ? items[0].owner_full_name : null;
  });

  tableData = computed<any[]>(() => {
    return this.itemsResource.value() || [];
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'added_at', header: 'Añadido el', type: 'datetime', filterable: false },
    ],
    searchableFields: ['product_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  onViewProduct(item: ListItemViewEntity) {
    this.router.navigate(['/products', item.product_id]);
  }

  goBack() {
    const redirectToUrl = this.redirectTo().length > 0 ? this.redirectTo() : '/users/lists';
    this.router.navigate([redirectToUrl]);
  }
}
