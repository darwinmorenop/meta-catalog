import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-import-excel-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <h2 mat-dialog-title>Importar Catálogo Excel</h2>
    <mat-dialog-content>
      <div class="upload-container">
        <div class="drop-zone" (click)="fileInput.click()" (drop)="onDrop($event)" (dragover)="onDragOver($event)">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p *ngIf="!selectedFile">Arrastra tu archivo aquí o haz clic para seleccionar</p>
          <p *ngIf="selectedFile" class="file-name">📄 {{ selectedFile.name }}</p>
          <input type="file" #fileInput hidden accept=".xlsx" (change)="onFileSelected($event)">
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!selectedFile" (click)="import()">
        Importar
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .upload-container {
      padding: 20px 0;
    }
    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .drop-zone:hover {
      border-color: #3f51b5;
      background-color: #f5f5f5;
    }
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #757575;
      margin-bottom: 16px;
    }
    .file-name {
      font-weight: bold;
      color: #3f51b5;
    }
  `]
})
export class ImportExcelDialogComponent {
    dialogRef = inject(MatDialogRef<ImportExcelDialogComponent>);
    selectedFile: File | null = null;

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer?.files.length) {
            this.selectedFile = event.dataTransfer.files[0];
        }
    }

    import() {
        if (this.selectedFile) {
            this.dialogRef.close(this.selectedFile);
        }
    }
}
