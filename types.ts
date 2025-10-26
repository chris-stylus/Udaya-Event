
export enum Role {
  Admin = 'admin',
  Student = 'student',
  Stall = 'stall',
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  class: string;
  role: Role.Student;
  balance: number;
}

export interface Stall {
  id: string;
  name: string;
  role: Role.Stall;
  menu: MenuItem[];
}

export interface Admin {
  id: string;
  name: string;
  role: Role.Admin;
}

export type LoggedInUser = User | Stall | Admin;

export enum TransactionType {
  Recharge = 'recharge',
  Purchase = 'purchase',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  studentId: string;
  studentName: string;
  stallId?: string;
  stallName?: string;
  items?: { name: string; price: number; quantity: number }[];
  adminId?: string;
}
