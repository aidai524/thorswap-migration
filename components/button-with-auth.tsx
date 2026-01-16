import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/wallet";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export function ButtonWithAuth({
  chainId,
  onClick,
  loading,
  disabled,
  children
}: {
  chainId: number;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { account, connect, switchChain, isSwitchingChain } = useWallet();

  if (!account?.address) {
    return (
      <Button className="cursor-pointer w-full" onClick={() => connect?.()}>
        Connect Wallet
      </Button>
    );
  }

  if (account?.chainId !== chainId) {
    return (
      <Button
        className="w-full cursor-pointer"
        size="lg"
        onClick={() => {
          switchChain?.(chainId);
        }}
        disabled={isSwitchingChain}
      >
        {isSwitchingChain ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Switching...
          </>
        ) : (
          `Switch Network`
        )}
      </Button>
    );
  }

  return (
    <Button
      className={clsx(
        "w-full",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
      size="lg"
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        children
      )}
    </Button>
  );
}
