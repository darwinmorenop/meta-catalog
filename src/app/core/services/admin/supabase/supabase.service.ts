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

  private activeSchema: string = 'free';

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

  setSchema(schema: string) {
    this.logger.info(`Switching active schema to: ${schema}`, this.CLASS_NAME);
    this.activeSchema = schema;
  }

  getSchema(): string {
    return this.activeSchema;
  }

  fromTier(view: string) {
    return this.supabase.schema(this.activeSchema).from(view);
  }

  fromCatalog(table: string) { return this.supabase.schema('catalog').from(table); }
  fromSales(table: string) { return this.supabase.schema('sales').from(table); }
  fromUsers(table: string) { return this.supabase.schema('users').from(table); }
  fromInventory(table: string) { return this.supabase.schema('inventory').from(table); }
  fromScrap(table: string) { return this.supabase.schema('scrap').from(table); }
}
