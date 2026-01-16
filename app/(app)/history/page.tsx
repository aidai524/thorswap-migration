import { StakeUserOperations } from "@/views/history/stake-user-operations";

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          History
        </h1>
        <p className="mt-2 text-muted-foreground">
          View your staking and locking operation history
        </p>
      </div>

      <StakeUserOperations />
    </div>
  );
}
