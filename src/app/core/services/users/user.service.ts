import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getAllBrandIdRequest(): Observable<string[]> {
    return of([""]);
  }

  getAnyBrandIdRequest(): Observable<string> {
    return of("www.sasandracorva64");
  }
}
