import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ChangeRecord } from 'src/app/core/models/meta-model';

@Component({
    selector: 'app-changes-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>Cambios Detectados</h2>
    <mat-dialog-content>
      <div *ngIf="data.changes.length === 0">No hay cambios recientes.</div>
      <div class="changes-list" *ngIf="data.changes.length > 0">
        <div *ngFor="let record of data.changes" class="change-item" [class.new]="record.type === 'NEW'">
          <div class="header">
            <span class="badge">{{ record.type }}</span>
            <strong>{{ record.product.title }}</strong>
          </div>
          <ul *ngIf="record.type === 'UPDATE'">
            <li *ngFor="let change of record.changes">
              {{ change.field }}: <span class="old">{{ change.oldValue }}</span> -> <span class="new-val">{{ change.newValue }}</span>
            </li>
          </ul>
           <div *ngIf="record.type === 'NEW'">
             <p>Nuevo producto importado: {{ record.product.description }} - {{ record.product.price }}</p>
           </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .changes-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .change-item {
      padding: 10px;
      border-bottom: 1px solid #ccc;
    }
    .change-item.new {
      background-color: #e8f5e9;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
    }
    .badge {
      background: #eee;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .new .badge {
        background: #4caf50;
        color: white;
    }
    .old {
        text-decoration: line-through;
        color: #888;
    }
    .new-val {
        color: #2e7d32;
        font-weight: bold;
    }
  `]
})
export class ChangesDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { changes: ChangeRecord[] },
        public dialogRef: MatDialogRef<ChangesDialogComponent>
    ) { }
}
