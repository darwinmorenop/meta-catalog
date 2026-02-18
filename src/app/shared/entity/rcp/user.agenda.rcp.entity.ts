import { UserProfile } from "src/app/shared/entity/user.profile.entity";

export interface UserAgendaLinkRcpEntity {
    p_owner_id: string;
    p_contact_id: string;
    p_alias: string;
    p_tags: string[];
}

export interface UserAgendaLinkRcpResponseEntity {
    status: string;
    message: string;
}

export interface UserAgendaCreateRcpEntity {
    p_owner_id: string,
    p_first_name: string,
    p_last_name: string,
    p_email: string,
    p_phone: string,
    p_alias: string,
    p_tags: string[],
    p_lead: string[],
    p_profile: UserProfile,
    p_birthday: Date,
    p_notes: string,
    p_user_profile_id: string
}

export interface UserAgendaCreateRcpResponseEntity {
    status: 'success' | 'conflict' | 'error';
    message: string;
    conflicting_users: string[];
    contact_id: string;
}
