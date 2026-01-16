import type { Token, Position, UnstakeRequest } from "./types";

export const mockPositions: Position[] = [
  {
    id: "1",
    type: "locked",
    amount: "15000",
    token: "METRO",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-04-15"),
    claimableRewards: "125.50",
    autocompound: false
  },
  {
    id: "2",
    type: "vesting",
    amount: "50000",
    token: "METRO",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2028-01-01"),
    claimableRewards: "420.75",
    autocompound: true
  },
  {
    id: "3",
    type: "flexible",
    amount: "5000",
    token: "METRO",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2099-12-31"),
    claimableRewards: "45.20",
    autocompound: false
  }
];

export const mockUnstakeRequests: UnstakeRequest[] = [
  {
    id: "1",
    amount: "2500",
    requestDate: new Date("2024-03-01"),
    availableDate: new Date("2024-03-15")
  }
];

export const mockWalletBalance = {
  THOR: "25000",
  yTHOR: "10000",
  METRO: "75000",
  USDC: "1250.50"
};

export const mockStats = {
  totalStaked: "75000",
  currentAPY: "12.5",
  claimableUSDC: "591.45",
  totalEarnedUSDC: "2450.00",
  // 新增字段
  totalLockAmount: "45000", // 总lock数量
  totalStakeAmount: "30000", // 总stake数量
  userLockAmount: "15000", // 用户lock数量
  userStakeAmount: "5000", // 用户stake数量
  apr: "12.5" // APR
};

// Stake信息接口
export interface StakeInfo {
  id: string;
  amount: string;
  endDate: Date;
  type: "lock" | "stake";
}

export const mockStakeInfos: StakeInfo[] = [
  {
    id: "1",
    amount: "15000",
    endDate: new Date("2024-04-15"),
    type: "lock"
  },
  {
    id: "2",
    amount: "5000",
    endDate: new Date("2024-06-01"),
    type: "stake"
  },
  {
    id: "3",
    amount: "10000",
    endDate: new Date("2024-05-20"),
    type: "lock"
  }
];
