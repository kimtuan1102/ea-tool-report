export interface JwtPayload {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
}
