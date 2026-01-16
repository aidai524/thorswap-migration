"use client";

import { ButtonWithAuth } from "@/components/button-with-auth";
import useApprove from "@/hooks/use-approve";
import type { Token } from "@/lib/types";

interface ButtonWithApproveProps {
  /** Token to approve */
  token: Token;
  /** Amount to check approval for (use small amount like "0.000001" for max approve check) */
  amount: string;
  /** Spender address (contract that will spend the token) */
  spender: string;
  /** Chain ID for the button */
  chainId: number;
  /** Action to execute after approval (e.g., stake function) */
  onAction: () => void | Promise<void>;
  /** Loading state for the action */
  actionLoading: boolean;
  /** Disabled state for the action */
  actionDisabled: boolean;
  /** Text to display on action button */
  actionText: React.ReactNode;
  /** Text to display on approve button (optional) */
  approveText?: React.ReactNode;
  /** Whether to use max approve (default: true) */
  isMax?: boolean;
  /** Whether to skip approval check (for native tokens) */
  isSkip?: boolean;
  /** Callback when approval succeeds */
  onApprovalSuccess?: () => void;
}

export function ButtonWithApprove({
  token,
  amount,
  spender,
  chainId,
  onAction,
  actionLoading,
  actionDisabled,
  actionText,
  approveText,
  isMax = true,
  isSkip = false,
  onApprovalSuccess
}: ButtonWithApproveProps) {
  const { approved, approve, approving, checking } = useApprove({
    token,
    amount: amount || "0.000001", // Use small amount to enable approval check
    spender,
    isMax,
    isSkip,
    onSuccess: onApprovalSuccess
  });

  // If not approved, show approve button
  if (!approved && !isSkip) {
    return (
      <ButtonWithAuth
        chainId={chainId}
        onClick={approve}
        loading={approving || checking}
        disabled={approving || checking}
      >
        {checking
          ? "Checking..."
          : approving
          ? "Approving..."
          : approveText || `Approve ${token.symbol}`}
      </ButtonWithAuth>
    );
  }

  // If approved, show action button
  return (
    <ButtonWithAuth
      chainId={chainId}
      onClick={onAction}
      loading={actionLoading}
      disabled={actionDisabled}
    >
      {actionText}
    </ButtonWithAuth>
  );
}
