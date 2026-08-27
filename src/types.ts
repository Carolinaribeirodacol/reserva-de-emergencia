export interface Profile {
  income: number;
  expenses: number;
  age: number;
  goal: 'stability' | 'travel' | 'other';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  reason: string;
  date: string;
}

export interface AppState {
  profile: Profile | null;
  balance: number;
  transactions: Transaction[];
}
