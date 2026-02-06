import useUnstakeRequests from "@/views/stake/use-unstake-requests";
import Rewards from "./rewards";
import StakeOperations from "./stake-operations";
import UnstakeHistory from "./unstake-history";

export default function Stake() {
  const { isLoading, error, unstakeRequests, refresh, withdrawableAmount } =
    useUnstakeRequests();
  return (
    <>
      <Rewards />
      <StakeOperations
        refetchData={() => {
          refresh();
        }}
      />
      <UnstakeHistory
        unstakeRequests={unstakeRequests}
        isLoading={isLoading}
        error={error}
        refresh={refresh}
        withdrawableAmount={withdrawableAmount}
      />
    </>
  );
}
