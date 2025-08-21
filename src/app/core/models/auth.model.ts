export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordReset {
  email: string;
  token: string;
  newPassword: string;
}
