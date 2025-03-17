export class UserDto {
  userId: string;
  username: string;
  email: string;
  role: string;
  organizationId?: string;
}

export class LoginResponseDto {
  access_token: string;
  user: UserDto;
}

export class MfaRequiredResponseDto {
  requiresMfa: boolean;
  userId: string;
  message: string;
}

export class RegisterResponseDto {
  message: string;
  userId: string;
}
