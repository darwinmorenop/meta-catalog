import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from '../../services/products/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit { 
  productos: any[] = [];
  constructor(private productService: ProductService) { }
  
  ngOnInit() {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('Datos locales cargados:', this.productos);
      },
      error: (error) => {
        console.error('Error conectando a Supabase Local:', error);
      }
    });
  }
}
