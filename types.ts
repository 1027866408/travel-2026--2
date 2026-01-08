export interface Trip {
  id: number | string;
  from: string;
  to: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  days: number | string;
  isHardship: boolean;
  mainTravelerId: string;
  fellowTravelerIds: string[];
  specificHardshipArea: string;
}

export interface Expense {
  id: number | string;
  source: 'personal' | 'corp';
  category: string;
  type: string;
  date: string;
  invoiceAmount: number | string;
  reimbursableAmount: number | string;
  taxRate: number | string;
  taxAmount: number | string;
  payeeId: string;
  desc: string;
  policyStatus: 'ok' | 'warn';
  receipt: boolean;
  msg?: string;
}

export interface Traveler {
  id: string;
  name: string;
  code: string;
  level: string;
  isMain: boolean;
  bankAccount: string;
  bankName: string;
}

export interface Loan {
  id: string;
  orderNo: string;
  totalAmount: number;
  remainingAmount: number;
  clearingAmount: number;
}

export interface BasicInfo {
  docNo: string;
  docDate: string;
  creator: string;
  reimburser: string;
  costOrg: string;
  costDept: string;
  description: string;
  requestId: string;
  isProject: boolean;
  projectType: string;
  projectCode: string;
  fundSource: string;
}

export interface Application {
  id: string;
  title: string;
  date: string;
  trips: Trip[];
  corpExpenses: Expense[];
}

export interface Project {
  code: string;
  name: string;
}

export interface City {
  name: string;
  pinyin: string;
  hardship: boolean;
  tier: string;
}