export interface RewardRecord {
  // Define based on actual API response structure
  [key: string]: any;
}

export interface RewardRecordsResponse {
  data: RewardRecord[];
  total?: number;
  page?: number;
  total_page?: number;
}

export interface GetRewardRecordsParams {
  address: string;
  page?: number;
  page_size?: number;
}

export interface AutocompoundResponse {
  balance_gas_fee: string;
  enable: boolean;
  total_gas_fee: string;
  used_gas_fee: string;
  withdraw: boolean;
  withdraw_gas_fee: string;
}

export interface WithdrawAutocompoundGasParams {
  address: string;
  signature: string;
}
