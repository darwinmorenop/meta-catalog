import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date-time-range',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: 'date-time-range.component.html',
  styleUrl: 'date-time-range.component.scss'
})
export class DateTimeRangeComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) startControlName!: string;
  @Input({ required: true }) endControlName!: string;
  @Input() startLabel: string = 'Fecha y Hora Inicio';
  @Input() endLabel: string = 'Fecha y Hora Fin';

  get startControl(): FormControl {
    return this.formGroup.get(this.startControlName) as FormControl;
  }

  get endControl(): FormControl {
    return this.formGroup.get(this.endControlName) as FormControl;
  }
}
