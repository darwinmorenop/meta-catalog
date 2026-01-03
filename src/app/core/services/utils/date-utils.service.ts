import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  /**
   * Parsea un string de fecha proveniente de la base de datos (UTC) 
   * a un objeto Date del navegador (Local).
   * Si el string no incluye zona horaria, asume que es UTC y le añade 'Z'.
   */
  parseDbDate(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date();
    
    // Si no tiene 'Z' ni '+', asumimos que es UTC y se lo añadimos
    const formattedStr = (dateStr.includes('Z') || dateStr.includes('+')) 
      ? dateStr 
      : `${dateStr}Z`;
      
    return new Date(formattedStr);
  }

  /**
   * Formatea una fecha para ser usada en un input de tipo datetime-local (YYYY-MM-DDTHH:mm).
   * Mantiene el tiempo local para que el input sea intuitivo para el usuario.
   */
  formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
