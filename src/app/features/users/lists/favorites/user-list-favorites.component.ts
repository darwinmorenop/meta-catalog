import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListEntity } from 'src/app/shared/entity/list.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ListViewEntity } from 'src/app/shared/entity/view/list.view.entity';

export type ListScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
    selector: 'app-user-list-favorites',
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
    templateUrl: './user-list-favorites.component.html',
    styleUrl: './user-list-favorites.component.scss'
})
export class UserListFavoritesComponent {
    private router = inject(Router);
    private listService = inject(UserListService);
    private userService = inject(UserService);
    private snackBar = inject(MatSnackBar);

    scopeControl = new FormControl<ListScopeType>('Personal', { nonNullable: true });
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

    listResource = rxResource({
        stream: () => this.listService.getFavorites(this.filteredUserIds())
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
            { key: 'owner_image', header: 'Foto', type: 'image', filterable: true },
            { key: 'owner_full_name', header: 'Nombre', filterable: true },
            { key: 'items_count', header: 'Nº de productos', filterable: false },
        ],
        searchableFields: ['owner_full_name'],
        pageSizeOptions: [10, 20, 50],
        actions: {
            show: true,
            view: true,
            edit: true,
            delete: false
        }
    };

    onViewList(item: any) {
        const showName = this.scope() !== 'Personal';
        this.router.navigate(['/users/lists', item.id], {
            queryParams: showName ? { showName: 'true', redirectTo: 'favorites' } : { redirectTo: 'favorites' }
        });
    }

    onEditList(item: ListEntity) {
        const showName = this.scope() !== 'Personal';
        this.router.navigate(['/users/lists', item.id, 'edit'], {
            queryParams: showName ? { showName: 'true' , redirectTo: 'favorites' } : { redirectTo: 'favorites' }
        });
    }
}
