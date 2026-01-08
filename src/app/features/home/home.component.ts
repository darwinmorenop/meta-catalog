import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private router = inject(Router);

  constructor() {
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToCampaigns() {
    this.router.navigate(['/campaigns']);
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }

  goToScraps() {
    this.router.navigate(['/scraps']);
  }
}
