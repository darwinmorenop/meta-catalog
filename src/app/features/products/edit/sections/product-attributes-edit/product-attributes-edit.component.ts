import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductEditComponent } from '../../product-edit.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-product-attributes-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './product-attributes-edit.component.html',
  styleUrl: './product-attributes-edit.component.scss'
})
export class ProductAttributesEditComponent implements OnInit {
  private parent = inject(ProductEditComponent);
  private fb = inject(FormBuilder);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductAttributesEditComponent.name;
  
  product = this.parent.product;
  form!: FormGroup;

  genderOptions = ['male', 'female', 'unisex'];
  formatOptions = ['spray', 'roll-on', 'gel', 'crema', 'solid'];
  unitOptions = ['ml', 'gr', 'oz'];

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  
  inciList = signal<string[]>([]);
  notesTopList = signal<string[]>([]);
  notesHeartList = signal<string[]>([]);
  notesBaseList = signal<string[]>([]);

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const a = this.product()?.attributes;
    
    // Initialize lists for chips
    this.inciList.set(a?.inci || []);
    this.notesTopList.set(a?.notes?.top || []);
    this.notesHeartList.set(a?.notes?.heart || []);
    this.notesBaseList.set(a?.notes?.base || []);

    this.form = this.fb.group({
      gender: [a?.gender || 'unisex'],
      format: [a?.format.toLowerCase() || 'spray'],
      size: [a?.size || ''],
      unit: [a?.unit || 'ml'],
      pao: [a?.pao || ''],
      claims: this.fb.group({
        is_vegan: [a?.claims?.is_vegan || false],
        is_cruelty_free: [a?.claims?.is_cruelty_free || false],
        is_refillable: [a?.claims?.is_refillable || false]
      })
    });
  }

  add(list: 'inci' | 'top' | 'heart' | 'base', event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const signalMap = {
        inci: this.inciList,
        top: this.notesTopList,
        heart: this.notesHeartList,
        base: this.notesBaseList
      };
      const currentList = signalMap[list];
      currentList.update(items => [...items, value]);
    }
    event.chipInput!.clear();
  }

  remove(list: 'inci' | 'top' | 'heart' | 'base', item: string): void {
    const signalMap = {
      inci: this.inciList,
      top: this.notesTopList,
      heart: this.notesHeartList,
      base: this.notesBaseList
    };
    const currentList = signalMap[list];
    currentList.update(items => items.filter(i => i !== item));
  }

  onSave() {
    if (this.form.valid) {
      const data = {
        ...this.form.getRawValue(),
        inci: this.inciList(),
        notes: {
          top: this.notesTopList(),
          heart: this.notesHeartList(),
          base: this.notesBaseList()
        }
      };
      this.loggerService.info('Saving attributes data:', data, this.CLASS_NAME, 'onSave');
    }
  }
}
