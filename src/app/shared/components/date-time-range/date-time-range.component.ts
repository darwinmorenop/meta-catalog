import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-time-range',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="date-row" [formGroup]="formGroup">
      <mat-form-field appearance="outline">
        <mat-label>{{ startLabel }}</mat-label>
        <input matInput type="datetime-local" [formControlName]="startControlName">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>{{ endLabel }}</mat-label>
        <input matInput type="datetime-local" [formControlName]="endControlName">
      </mat-form-field>
    </div>
  `,
  styles: [`
    .date-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      
      mat-form-field {
        flex: 1;
      }

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class DateTimeRangeComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) startControlName!: string;
  @Input({ required: true }) endControlName!: string;
  @Input() startLabel: string = 'Fecha y Hora Inicio';
  @Input() endLabel: string = 'Fecha y Hora Fin';
}
