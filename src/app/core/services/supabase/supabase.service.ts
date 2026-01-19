import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = SupabaseService.name;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    this.logger.info('SupabaseService initialized', this.CLASS_NAME);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
