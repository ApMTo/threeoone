export type JwtPayload = {
  sub: string;
  email: string;
  role: 'customer' | 'admin';
};
