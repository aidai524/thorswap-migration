"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";
import useDepositGasRecords from "@/hooks/use-deposit-gas-records";
import useWithdrawGasRecords from "@/hooks/use-withdraw-gas-records";
import { formatNumber } from "@/lib/format-number";
import dayjs from "@/lib/dayjs";

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
  return dayjs(date).format("MMM D, YYYY HH:mm");
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

interface GasRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Gas records dialog component for displaying deposit and withdraw records
 */
export function GasRecordsDialog({
  open,
  onOpenChange
}: GasRecordsDialogProps) {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdraws">(
    "deposits"
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks for deposit and withdraw records
  const {
    records: depositRecords,
    total: depositTotal,
    currentPage: depositCurrentPage,
    totalPages: depositTotalPages,
    isLoading: isLoadingDeposits,
    error: depositError,
    nextPage: nextDepositPage,
    prevPage: prevDepositPage,
    goToPage: goToDepositPage,
    refresh: refreshDeposits
  } = useDepositGasRecords(10);

  const {
    records: withdrawRecords,
    total: withdrawTotal,
    currentPage: withdrawCurrentPage,
    totalPages: withdrawTotalPages,
    isLoading: isLoadingWithdraws,
    error: withdrawError,
    nextPage: nextWithdrawPage,
    prevPage: prevWithdrawPage,
    goToPage: goToWithdrawPage,
    refresh: refreshWithdraws
  } = useWithdrawGasRecords(10);

  /**
   * Handle tab change with debounce
   */
  const handleTabChange = useCallback(
    (value: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new tab value immediately
      const newTab = value as "deposits" | "withdraws";
      setActiveTab(newTab);

      // Debounce the refresh call
      debounceTimerRef.current = setTimeout(() => {
        if (newTab === "deposits") {
          refreshDeposits();
        } else {
          refreshWithdraws();
        }
      }, 300);
    },
    [refreshDeposits, refreshWithdraws]
  );

  /**
   * Refresh deposit records when dialog opens
   */
  useEffect(() => {
    if (open) {
      // Reset to deposits tab and refresh when dialog opens
      setActiveTab("deposits");
      refreshDeposits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle deposit page click
   */
  const handleDepositPageClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    e.preventDefault();
    await goToDepositPage(page);
  };

  /**
   * Handle deposit previous page click
   */
  const handleDepositPrevClick = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    await prevDepositPage();
  };

  /**
   * Handle deposit next page click
   */
  const handleDepositNextClick = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    await nextDepositPage();
  };

  /**
   * Handle withdraw page click
   */
  const handleWithdrawPageClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number
  ) => {
    e.preventDefault();
    await goToWithdrawPage(page);
  };

  /**
   * Handle withdraw previous page click
   */
  const handleWithdrawPrevClick = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    await prevWithdrawPage();
  };

  /**
   * Handle withdraw next page click
   */
  const handleWithdrawNextClick = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    await nextWithdrawPage();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[600px] sm:!max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gas Records</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdraws">Withdraws</TabsTrigger>
          </TabsList>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="mt-4">
            {/* Loading state */}
            {isLoadingDeposits && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error state */}
            {depositError && !isLoadingDeposits && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{depositError}</p>
              </div>
            )}

            {/* Records table */}
            {!isLoadingDeposits && !depositError && (
              <>
                {depositRecords.length > 0 ? (
                  <>
                    <div className="mt-4 rounded-md border overflow-hidden">
                      <div className="[&>div]:overflow-x-visible">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">
                                Amount
                              </TableHead>
                              <TableHead className="w-[200px]">
                                Transaction Hash
                              </TableHead>
                              <TableHead className="w-[200px]">Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {depositRecords.map((record, index) => {
                              const amount = record.amount || "0";
                              const txHash =
                                record.tx_hash || record.txHash || "";
                              const txTime = record.tx_time
                                ? record.tx_time * 1000
                                : "";

                              return (
                                <TableRow
                                  key={record.id || record._id || index}
                                >
                                  <TableCell className="font-medium">
                                    {formatNumber(amount, 6, true)} ETH
                                  </TableCell>
                                  <TableCell>
                                    {txHash ? (
                                      <a
                                        href={getExplorerUrl(txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                      >
                                        {formatTxHash(txHash)}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground whitespace-normal">
                                    {txTime ? formatDate(txTime) : "-"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {depositTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={handleDepositPrevClick}
                                href="#"
                                className={
                                  depositCurrentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {generatePageNumbers(
                              depositCurrentPage,
                              depositTotalPages
                            ).map((page, index) => (
                              <PaginationItem key={index}>
                                {page === "ellipsis" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={(e) =>
                                      handleDepositPageClick(e, page)
                                    }
                                    href="#"
                                    isActive={depositCurrentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={handleDepositNextClick}
                                href="#"
                                className={
                                  depositCurrentPage === depositTotalPages
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
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No deposit records yet
                  </p>
                )}
              </>
            )}
          </TabsContent>

          {/* Withdraws Tab */}
          <TabsContent value="withdraws" className="mt-4">
            {/* Loading state */}
            {isLoadingWithdraws && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error state */}
            {withdrawError && !isLoadingWithdraws && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{withdrawError}</p>
              </div>
            )}

            {/* Records table */}
            {!isLoadingWithdraws && !withdrawError && (
              <>
                {withdrawRecords.length > 0 ? (
                  <>
                    <div className="mt-4 rounded-md border overflow-hidden">
                      <div className="[&>div]:overflow-x-visible">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">
                                Amount
                              </TableHead>
                              <TableHead className="w-[200px]">
                                Transaction Hash
                              </TableHead>
                              <TableHead className="w-[240px] shrink-0">
                                Created At
                              </TableHead>
                              <TableHead className="w-[120px]">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {withdrawRecords.map((record, index) => {
                              const status = record.status;
                              const amount =
                                status === 1 ? record.amount || "0" : "-";
                              const txHash =
                                record.tx_hash || record.txHash || "";
                              const createdAt =
                                record.created_at || record.createdAt || "";

                              return (
                                <TableRow
                                  key={record.id || record._id || index}
                                >
                                  <TableCell className="font-medium">
                                    {amount !== "-"
                                      ? `${formatNumber(amount, 6, true)} ETH`
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    {txHash ? (
                                      <a
                                        href={getExplorerUrl(txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                      >
                                        {formatTxHash(txHash)}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground whitespace-normal">
                                    {createdAt ? formatDate(createdAt) : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        status === 1 ? "default" : "secondary"
                                      }
                                    >
                                      {status === 1 ? "Processed" : "Pending"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {withdrawTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={handleWithdrawPrevClick}
                                href="#"
                                className={
                                  withdrawCurrentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {generatePageNumbers(
                              withdrawCurrentPage,
                              withdrawTotalPages
                            ).map((page, index) => (
                              <PaginationItem key={index}>
                                {page === "ellipsis" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={(e) =>
                                      handleWithdrawPageClick(e, page)
                                    }
                                    href="#"
                                    isActive={withdrawCurrentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={handleWithdrawNextClick}
                                href="#"
                                className={
                                  withdrawCurrentPage === withdrawTotalPages
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
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No withdraw records yet
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
