"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import apiService, {
  type RewardRecord,
  type RewardRecordsResponse
} from "@/services/api";

/**
 * Hook return value interface
 */
interface UseRewardsHistoryReturn {
  /** Reward records list */
  records: RewardRecord[];
  /** Total number of records */
  total: number;
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch reward records */
  fetchRecords: (page?: number, pageSize?: number) => Promise<void>;
  /** Go to next page */
  nextPage: () => Promise<void>;
  /** Go to previous page */
  prevPage: () => Promise<void>;
  /** Go to specific page */
  goToPage: (page: number) => Promise<void>;
  /** Refresh current page */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching reward history records with pagination
 *
 * @param initialPageSize - Initial number of items per page, defaults to 10
 * @returns Reward history state and control functions
 */
export default function useRewardsHistory(
  initialPageSize: number = 10
): UseRewardsHistoryReturn {
  const { account } = useWallet();
  const [records, setRecords] = useState<RewardRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate total pages
   */
  const totalPages = Math.ceil(total / pageSize) || 1;

  /**
   * Fetch reward records from API
   */
  const fetchRecords = useCallback(
    async (page?: number, newPageSize?: number) => {
      if (!account?.address) {
        setRecords([]);
        setTotal(0);
        setError(null);
        return;
      }

      const targetPage = page ?? currentPage;
      const targetPageSize = newPageSize ?? pageSize;

      setIsLoading(true);
      setError(null);

      try {
        const response: RewardRecordsResponse =
          await apiService.getRewardRecords({
            address: account.address,
            page: targetPage,
            page_size: targetPageSize
          });
 
        setRecords(response.data || []);
        setTotal(response.total || 0);
        setCurrentPage(response.total_page || targetPage);
        if (newPageSize !== undefined) {
          setPageSize(targetPageSize);
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch reward records";
        setError(errorMessage);
        setRecords([]);
        setTotal(0);
        console.error("Error fetching reward records:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address, currentPage, pageSize]
  );

  /**
   * Go to next page
   */
  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await fetchRecords(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchRecords]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await fetchRecords(currentPage - 1);
    }
  }, [currentPage, fetchRecords]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= totalPages) {
        await fetchRecords(page);
      }
    },
    [totalPages, fetchRecords]
  );

  /**
   * Refresh current page
   */
  const refresh = useCallback(async () => {
    await fetchRecords();
  }, [fetchRecords]);

  /**
   * Auto fetch records when account changes or component mounts
   */
  useEffect(() => {
    if (account?.address) {
      setCurrentPage(1);
      fetchRecords(1, initialPageSize);
    } else {
      setRecords([]);
      setTotal(0);
      setError(null);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  return {
    records,
    total,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    error,
    fetchRecords,
    nextPage,
    prevPage,
    goToPage,
    refresh
  };
}
