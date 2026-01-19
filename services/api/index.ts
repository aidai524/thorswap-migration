import axios, { type AxiosInstance } from "axios";

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
    const response = await this.api.get<{data: RewardRecordsResponse}>(
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
}

export default new DollaService();
