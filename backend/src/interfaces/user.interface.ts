export interface BasicCreateDTO {
  email: string;
  name?: string;
  password_hash?: string;
  avatar_url?: string | null;
  provider?: string;
  foodPreferences?: number[];
  communityPreferences?: number[];
}

export interface UserPayload {
  id: number; 
  name: string;
  email: string;
  role: string;
  provider: string;
  isBusiness: boolean;
  active: boolean;
  subscription_status: string;
  avatar_url: string | null;
}

export interface RegisterStepOneDto {
  email: string;
  password: string;
}

export interface RegisterStepTwoDto {
  name?: string;
  foodPreferences?: number[];
  communityPreferences?: number[];
}




