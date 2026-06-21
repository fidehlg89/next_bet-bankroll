export type BankrollTransactionType = "deposit" | "withdrawal" | "initial";

export interface BankrollTransaction {
  id: string;
  user_id: string;
  transaction_date: string;
  type: BankrollTransactionType;
  amount: number;
  notes: string | null;
  created_at: string;
}

export interface BankrollTransactionInput {
  transaction_date: string;
  type: BankrollTransactionType;
  amount: number;
  notes?: string;
}
