"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { History, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import useRewardsHistory from "@/hooks/use-rewards-history";
import { formatNumber } from "@/lib/format-number";

/**
 * Format transaction hash for display
 */
function formatTxHash(txHash: string): string {
  if (!txHash) return "";
  if (txHash.length <= 10) return txHash;
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string | number | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Get explorer URL for transaction hash
 */
function getExplorerUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}

/**
 * Generate page numbers for pagination
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Show first few pages
      for (let i = 2; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Show last few pages
      pages.push("ellipsis");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return pages;
}

export function RewardsHistory() {
  const {
    records,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    nextPage,
    prevPage,
    goToPage
  } = useRewardsHistory(10);

  /**
   * Handle page click
   */
  const handlePageClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    e.preventDefault();
    await goToPage(page);
  };

  /**
   * Handle previous page click
   */
  const handlePrevClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await prevPage();
  };

  /**
   * Handle next page click
   */
  const handleNextClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await nextPage();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Reward History
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({total} {total === 1 ? "record" : "records"})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Records list */}
        {!isLoading && !error && (
          <>
            <div className="space-y-3">
              {records.length > 0 ? (
                records.map((record, index) => {
                  // Map API response fields to display format
                  // Adjust these field names based on actual API response structure
                  const txHash =
                    record.txHash || record.tx_hash || record.hash || "";
                  const amount = record.amount || record.reward_amount || "0";
                  const type = record.category === 1? "claim" : "compounded";
                  const date =
                    record.date || record.created_at || record.timestamp || "";

                  return (
                    <div
                      key={record.id || record._id || index}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            type === "claim" 
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {type === "claim"
                            ? "Claimed"
                            : type === "compounded"
                            ? "Compounded"
                            : type}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {formatNumber(amount, 2, true)} USDC
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(date)}
                          </p>
                        </div>
                      </div>

                      {txHash && (
                        <a
                          href={getExplorerUrl(txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {formatTxHash(txHash)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No reward history yet
                </p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevClick}
                        href="#"
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {generatePageNumbers(currentPage, totalPages).map(
                      (page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={(e) => handlePageClick(e, page)}
                              href="#"
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextClick}
                        href="#"
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
