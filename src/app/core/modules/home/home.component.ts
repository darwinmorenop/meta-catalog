import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ManualDialogComponent } from '../manual-dialog/manual-dialog.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    template: `
    <div class="home-container">
      <h1>Bienvenido al Gestor de Catálogo</h1>
      <div class="button-group">
        <button mat-raised-button color="primary" (click)="openManual()">Manual</button>
        <button mat-raised-button color="accent" (click)="goToCatalog()">Catalog Online</button>
      </div>
    </div>
  `,
    styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 2rem;
    }
    .button-group {
      display: flex;
      gap: 1rem;
    }
    button {
      padding: 1.5rem 3rem;
      font-size: 1.2rem;
    }
  `]
})
export class HomeComponent {
    private router = inject(Router);
    private dialog = inject(MatDialog);

    openManual() {
        this.dialog.open(ManualDialogComponent, {
            width: '400px'
        });
    }

    goToCatalog() {
        this.router.navigate(['/catalog']);
    }
}
