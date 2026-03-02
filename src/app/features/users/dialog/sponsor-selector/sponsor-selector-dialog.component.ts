import { Component, inject, computed, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum, UserRankLabel } from 'src/app/core/models/users/user.model';
import { UserReadService } from 'src/app/core/services/admin/users/main/read/user-read.service';

@Component({
  selector: 'app-sponsor-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SmartTableComponent
  ],
  templateUrl: 'sponsor-selector-dialog.component.html',
  styleUrls: ['sponsor-selector-dialog.component.scss']
})
export class SponsorSelectorDialogComponent {
  private readonly userReadService = inject(UserReadService);
  private readonly dialogRef = inject(MatDialogRef<SponsorSelectorDialogComponent>);
  public data = inject<{ editingUserId: string }>(MAT_DIALOG_DATA);

  sponsorsResource = rxResource({
    stream: () => this.userReadService.getAvailableSponsors(this.data.editingUserId)
  });

  tableData = computed(() => {
    const sponsors = (this.sponsorsResource.value() ?? []) as UserSponsorEntity[];
    return sponsors.map(s => ({
      ...s,
      rankLabel: UserRankLabel[s.rank as UserRankEnum] || s.rank
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'fullName', header: 'Nombre', filterable: true },
      { key: 'rankLabel', header: 'Rango', filterable: true },
      { key: 'isEligible', header: 'Elegible', type: 'boolean', filterable: true },
      { key: 'reason', header: 'Motivo / Nota', filterable: true },
    ],
    searchableFields: ['fullName', 'rankLabel'],
    actions: {
      show: false,
      edit: false,
      delete: false,
      view: false
    },
    pageSizeOptions: [5, 10]
  };


  onSelect(sponsor: UserSponsorEntity) {
    if (sponsor.isEligible) {
      this.dialogRef.close(sponsor);
    }
  }
}
