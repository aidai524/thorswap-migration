export type ThorPhase = "10M" | "3M";

export type YThorPhase = "4Y";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  chainId: number;
  chainName: string;
  icon: string;
}

export interface Position {
  id: string;
  type: "locked" | "vesting" | "flexible";
  amount: string;
  token: string;
  startDate: Date;
  endDate: Date;
  claimableRewards: string;
  autocompound: boolean;
}

export interface UnstakeRequest {
  id: string;
  amount: string;
  requestDate: Date;
  availableDate: Date;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  balance: Record<string, string>;
}

export interface TransactionStatus {
  status: "idle" | "pending" | "confirmed" | "error";
  hash?: string;
  message?: string;
}
