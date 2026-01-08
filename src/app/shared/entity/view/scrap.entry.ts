export interface ScrapSummaryEntry {
  scrap_id: number;
  client: string;
  created_at: string;
  campaign_id: number;
  campaign_name: string;
  campaign_description: string;
  total_general: number;
  total_updated: number;
  total_created: number;
  total_archived: number;
}