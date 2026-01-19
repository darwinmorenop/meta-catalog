import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CampaignDaoSupabaseService } from 'src/app/core/services/campaigns/dao/campaign.dao.supabase.service';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private campaignDao = inject(CampaignDaoSupabaseService);

  getCurrentCampaigns(): Observable<CampaignEntity[]> {
    return this.campaignDao.getCurrent();
  }

  getAllCampaigns(): Observable<CampaignEntity[]> {
    return this.campaignDao.getAll();
  }

  createCampaign(campaign: Partial<CampaignEntity>): Observable<CampaignEntity | null> {
    return this.campaignDao.create(campaign);
  }

  updateCampaign(id: number, updates: Partial<CampaignEntity>): Observable<CampaignEntity | null> {
    return this.campaignDao.update(id, updates);
  }

  deleteCampaign(id: number): Observable<any> {
    return this.campaignDao.delete(id);
  }
}
