import Big from "big.js";
import { formatUnits, parseUnits, erc20Abi } from "viem";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Token } from "@/lib/types";
import { useWallet } from "@/contexts/wallet";

export const MAX_APPROVE =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Using erc20Abi from viem instead of custom ABI

export default function useApprove({
  token,
  amount,
  spender,
  isSkip,
  isMax,
  onSuccess
}: {
  token?: Token;
  amount?: string;
  spender?: string;
  isSkip?: boolean;
  isMax?: boolean;
  onSuccess?: VoidFunction;
  checkApproved?: VoidFunction;
}) {
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [allowance, setAllowance] = useState<any>(0);
  const { account, publicClient, walletClient } = useWallet();

  const checkApproved = async () => {
    if (!token?.address || !amount || !spender || !account?.address) return;
    if (
      token?.address === "0x0000000000000000000000000000000000000000" ||
      token?.address === "native"
    ) {
      setApproved(true);
      setChecking(false);
      return;
    }
    if (!publicClient) {
      console.log("publicClient not available");
      return;
    }
    try {
      setChecking(true);
      const allowanceRes = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account.address as `0x${string}`, spender as `0x${string}`]
      });

      const _allowance = formatUnits(allowanceRes as bigint, token.decimals);

      const needApproved = Big(_allowance).lt(amount || "0");
      setAllowance(_allowance);
      setApproved(!needApproved);
      setChecking(false);
    } catch (err) {
      console.log("check approved failed: %o", err);
      setChecking(false);
    }
  };

  const approve = async () => {
    if (!token?.address || !amount || !spender || !account?.address) return;
    if (!walletClient || !publicClient) {
      toast({
        title: "Approve Failed!",
        description: "Wallet not connected",
        variant: "destructive"
      });
      return;
    }
    setApproving(true);
    try {
      let approveValue = amount;
      if (isMax) {
        approveValue = Big(MAX_APPROVE)
          .div(Big(10).pow(token.decimals))
          .toFixed(token.decimals);
      }

      const value = parseUnits(
        Big(approveValue).toFixed(token.decimals),
        token.decimals
      );

      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender as `0x${string}`, value]
        });
      } catch (err) {
        console.log("gas estimation failed:", err);
      }

      // Send transaction
      const hash = await walletClient.writeContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender as `0x${string}`, value],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setApproving(false);
      if (receipt.status === "success") {
        setApproved(true);
        onSuccess?.();
        toast({
          title: "Approve Successful!",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.log("err", err);
      toast({
        title: "Approve Failed!",
        description:
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Transaction failed",
        variant: "destructive"
      });
      setApproving(false);
    }
  };

  useEffect(() => {
    if (
      isSkip ||
      token?.address === "0x0000000000000000000000000000000000000000" ||
      token?.address === "native"
    ) {
      setApproved(true);
      return;
    }

    if (token && amount && spender && publicClient && account?.address)
      checkApproved();
  }, [token, amount, spender, isSkip, publicClient, account?.address]);

  return { approved, approve, approving, checking, allowance, checkApproved };
}
