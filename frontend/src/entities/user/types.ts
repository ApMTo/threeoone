export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
