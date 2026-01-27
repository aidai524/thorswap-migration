import axios, { type AxiosInstance } from "axios";
import type {
  RewardRecordsResponse,
  GetRewardRecordsParams,
  AutocompoundResponse,
  WithdrawAutocompoundGasParams,
  GetAutocompoundGasDepositsParams,
  GetAutocompoundGasWithdrawsParams,
  AutocompoundGasRecordsResponse
} from "./types";

export type {
  RewardRecord,
  RewardRecordsResponse,
  GetRewardRecordsParams,
  AutocompoundResponse,
  WithdrawAutocompoundGasParams,
  GetAutocompoundGasDepositsParams,
  GetAutocompoundGasWithdrawsParams,
  AutocompoundGasRecordsResponse
} from "./types";

class DollaService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: "https://test-api-metro.dapdap.net/",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  /**
   * Get reward records list
   * @param params - Query parameters
   * @param params.address - User address
   * @param params.page - Page number, defaults to 1
   * @param params.page_size - Number of items per page, defaults to 10
   * @returns Reward records list
   */
  async getRewardRecords(
    params: GetRewardRecordsParams
  ): Promise<RewardRecordsResponse> {
    const { address, page = 1, page_size = 10 } = params;
    const response = await this.api.get<{ data: RewardRecordsResponse }>(
      "/v1/reward/records",
      {
        params: {
          address,
          page,
          page_size
        }
      }
    );
    return response.data.data;
  }

  /**
   * Get autocompound information
   * @param address - User address
   * @returns Autocompound information including gas fees and enable status
   */
  async getAutocompoundGasFee(address: string): Promise<AutocompoundResponse> {
    const response = await this.api.get<{ data: AutocompoundResponse }>(
      "/v1/autocompound",
      {
        params: {
          address
        }
      }
    );
    return response.data.data;
  }

  /**
   * Withdraw autocompound gas fee
   * @param params - Request parameters
   * @param params.address - User address
   * @param params.signature - Signature for authentication
   * @returns Response data
   */
  async withdrawAutocompoundGas(
    params: WithdrawAutocompoundGasParams
  ): Promise<any> {
    const { address, signature } = params;
    const response = await this.api.post<{ data: any }>(
      "/v1/autocompound/gas/withdraw",
      {
        address,
        signature
      }
    );
    return response.data.data;
  }

  /**
   * Get autocompound gas deposits records
   * @param params - Query parameters
   * @param params.address - User address
   * @param params.page - Page number, defaults to 1
   * @param params.pageSize - Number of items per page, defaults to 10
   * @returns Autocompound gas deposits records list
   */
  async getAutocompoundGasDeposits(
    params: GetAutocompoundGasDepositsParams
  ): Promise<AutocompoundGasRecordsResponse> {
    const { address, page = 1, pageSize = 10 } = params;
    const response = await this.api.get<{
      data: AutocompoundGasRecordsResponse;
    }>("/v1/autocompound/gas/deposits", {
      params: {
        address,
        page,
        pageSize
      }
    });
    return response.data.data;
  }

  /**
   * Get autocompound gas withdraws records
   * @param params - Query parameters
   * @param params.address - User address
   * @param params.page - Page number, defaults to 1
   * @param params.pageSize - Number of items per page, defaults to 10
   * @returns Autocompound gas withdraws records list
   */
  async getAutocompoundGasWithdraws(
    params: GetAutocompoundGasWithdrawsParams
  ): Promise<AutocompoundGasRecordsResponse> {
    const { address, page = 1, pageSize = 10 } = params;
    const response = await this.api.get<{
      data: AutocompoundGasRecordsResponse;
    }>("/v1/autocompound/gas/withdraws", {
      params: {
        address,
        page,
        pageSize
      }
    });
    return response.data.data;
  }
}

export default new DollaService();
