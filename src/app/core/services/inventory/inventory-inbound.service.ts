import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryInboundDaoSupabaseService } from './dao/inventory-inbound.dao.supabase.service';
import { InventoryInboundInsertRcpEntity } from 'src/app/shared/entity/rcp/inventory.inbound.rcp.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { InventoryInboundEntity } from 'src/app/shared/entity/view/inventory.inbound.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryInboundService {
  private dao = inject(InventoryInboundDaoSupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = InventoryInboundService.name;

  registerInbound(inbound: InventoryInboundInsertRcpEntity): Observable<any> {
    this.logger.debug('Registering new inventory inbound', this.CLASS_NAME, 'registerInbound');
    return this.dao.insertInboundRpc(inbound);
  }

  getAll(): Observable<InventoryInboundEntity[]> {
    this.logger.debug('Getting all inventory inbound', this.CLASS_NAME, 'getAll');
    return this.dao.getAll();
  }

  getInboundById(id: number): Observable<any> {
    this.logger.debug(`Getting inbound by id: ${id}`, this.CLASS_NAME, 'getInboundById');
    return this.dao.getInboundById(id);
  }
}
