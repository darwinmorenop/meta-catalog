export interface UserAgendaEntity {
    owner_id: number;
    contact_id: number;
    alias: string | null;
    tags: string[] | null;
    created_at: Date;
    updated_at: Date;
    lead: string[] | null;
    notes: string | null;
    follow_up_history: UserAgendaHistory[] | null;
    last_contact_history: UserAgendaHistory[] | null;
}

export interface UserAgendaHistory {
    created_at: Date;
    result: string;
    notes: string;
}
