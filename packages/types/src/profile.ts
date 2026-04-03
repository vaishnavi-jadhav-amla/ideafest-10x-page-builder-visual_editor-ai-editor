export interface IProfileData {
  profiles: IProfile;
  customerName?: string;
}

export interface IProfile {
  profileId: number;
  profileName?: string;
}