import type { Token, Position, UnstakeRequest, MigrationPhase } from "./types"

export const tokens: Token[] = [
  {
    symbol: "THOR",
    name: "THORSwap Token",
    decimals: 18,
    address: "0xa5f2211b9b8170f694421f2046281775e8468044",
    network: "ethereum",
    icon: "/tokens/thor.svg",
  },
  {
    symbol: "yTHOR",
    name: "Vesting THOR",
    decimals: 18,
    address: "0x1234567890123456789012345678901234567890",
    network: "ethereum",
    icon: "/tokens/ythor.svg",
  },
  {
    symbol: "METRO",
    name: "METRO Token",
    decimals: 18,
    address: "0xabcdef0123456789abcdef0123456789abcdef01",
    network: "base",
    icon: "/tokens/metro.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    network: "base",
    icon: "/tokens/usdc.svg",
  },
]

export const migrationPhases: MigrationPhase[] = [
  {
    phase: 1,
    lockDuration: "10 months",
    description: "Early migration with extended lock period",
    active: false,
  },
  {
    phase: 2,
    lockDuration: "3 months",
    description: "Standard migration period",
    active: true,
  },
]

export const mockPositions: Position[] = [
  {
    id: "1",
    type: "locked",
    amount: "15000",
    token: "METRO",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-04-15"),
    claimableRewards: "125.50",
    autocompound: false,
  },
  {
    id: "2",
    type: "vesting",
    amount: "50000",
    token: "METRO",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-01-01"),
    claimableRewards: "420.75",
    autocompound: true,
  },
  {
    id: "3",
    type: "flexible",
    amount: "5000",
    token: "METRO",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2099-12-31"),
    claimableRewards: "45.20",
    autocompound: false,
  },
]

export const mockUnstakeRequests: UnstakeRequest[] = [
  {
    id: "1",
    amount: "2500",
    requestDate: new Date("2024-03-01"),
    availableDate: new Date("2024-03-15"),
  },
]

export const mockWalletBalance = {
  THOR: "25000",
  yTHOR: "10000",
  METRO: "75000",
  USDC: "1250.50",
}

export const mockStats = {
  totalStaked: "75000",
  currentAPY: "12.5",
  claimableUSDC: "591.45",
  totalEarnedUSDC: "2450.00",
}
