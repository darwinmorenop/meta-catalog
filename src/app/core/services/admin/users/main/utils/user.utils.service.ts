import { Injectable } from '@angular/core';
import { UserDashboardModel, UserRankEnum } from 'src/app/core/models/users/user.model';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserEntity } from 'src/app/shared/entity/user.entity';

@Injectable({
  providedIn: 'root'
})
export class UserUtilsService {

  constructor() {
  }

  mapToDetailedEntity(item: any): UserNetworkDetail {
    return {
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      rank: item.rank as UserRankEnum,
      image: item.image,
      isManual: item.is_manual,
      identifier: item.identifier,
      pathStr: item.path_str,
      relativeLevel: item.relative_level,
      sponsorId: item.sponsor_id,
      sponsorFirstName: item.sponsor_first_name,
      sponsorLastName: item.sponsor_last_name,
      sponsorFullName: item.sponsor_full_name,
      sponsorEmail: item.sponsor_email,
      sponsorIdentifier: item.sponsor_identifier,
      sponsorPhone: item.sponsor_phone,
      sponsorRank: item.sponsor_rank as UserRankEnum,
      sponsorImage: item.sponsor_image,
      user_profile_id: item.profile_id,
      user_profile_name: item.profile_name,
      settings: item.settings
    };
  }

  mapToEntity(item: any): UserEntity {
    return {
      id: item.id,
      user_owner_id: item.user_owner_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      externalAuthId: item.external_auth_id || item.externalAuthId,
      email: item.email,
      phone: item.phone,
      isManual: item.is_manual ?? item.isManual ?? true,
      firstName: item.first_name || item.firstName,
      lastName: item.last_name || item.lastName,
      rank: item.rank,
      sponsorId: item.sponsor_id || item.sponsorId,
      path: item.path,
      identifier: item.identifier,
      image: item.image,
      user_profile_id: item.user_profile_id,
      settings: item.settings,
      profile: item.profile,
      birthday: item.birthday,
      status: item.status,
      notes: item.notes,
    };
  }


  mapToDb(user: Partial<UserEntity>): any {
    return {
      email: user.email,
      phone: user.phone,
      is_manual: user.isManual,
      first_name: user.firstName,
      last_name: user.lastName,
      rank: user.rank,
      sponsor_id: user.sponsorId,
      identifier: user.identifier,
      image: user.image,
      settings: user.settings,
      external_auth_id: user.externalAuthId,
      user_profile_id: user.user_profile_id
    };
  }

  mapToSponsor(item: any): UserSponsorEntity {
    return {
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      rank: item.rank as UserRankEnum,
      isEligible: item.is_eligible,
      reason: item.reason
    }
  }

  mapToUserDashboardModel(users: UserEntity[]): UserDashboardModel[] {
    if (!users) return [];
    return users.map((user: UserEntity) => {
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isManual: user.isManual,
        identifier: user.identifier,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank as UserRankEnum,
        sponsor: user.sponsorId ? this.convertToUserDashboardModel(users.find((u: UserEntity) => u.id === user.sponsorId)) : null, // TODO: mejorar trayendo el objeto creado
        image: user.image,
        user_profile_id: user.user_profile_id,
        settings: user.settings
      };
    })
  }

  private convertToUserDashboardModel(user: UserEntity | undefined): UserDashboardModel | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isManual: user.isManual,
      identifier: user.identifier,
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank as UserRankEnum,
      sponsor: null, // To avoid infinite loop
      image: user.image,
      user_profile_id: user.user_profile_id,
      settings: user.settings
    };
  }

}