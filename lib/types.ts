export type Network = "ethereum" | "base"

export type TokenSymbol = "THOR" | "yTHOR" | "METRO" | "USDC"

export interface Token {
  symbol: TokenSymbol
  name: string
  decimals: number
  address: string
  network: Network
  icon: string
}

export interface Position {
  id: string
  type: "locked" | "vesting" | "flexible"
  amount: string
  token: TokenSymbol
  startDate: Date
  endDate: Date
  claimableRewards: string
  autocompound: boolean
}

export interface UnstakeRequest {
  id: string
  amount: string
  requestDate: Date
  availableDate: Date
}

export interface MigrationPhase {
  phase: number
  lockDuration: string
  description: string
  active: boolean
}

export interface WalletState {
  connected: boolean
  address: string | null
  network: Network | null
  balance: Record<TokenSymbol, string>
}

export interface TransactionStatus {
  status: "idle" | "pending" | "confirmed" | "error"
  hash?: string
  message?: string
}
