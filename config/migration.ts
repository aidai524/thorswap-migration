import type { ThorPhase, YThorPhase } from "@/lib/types";

export const ThorPhaseConfig: Record<
  ThorPhase,
  { key: ThorPhase; lockDuration: string; description: string }
> = {
  "10M": {
    key: "10M",
    lockDuration: "10 months",
    description: "Extended lock for bonus migration multiplier. Limited supply."
  },
  "3M": {
    key: "3M",
    lockDuration: "3 months",
    description:
      "Standard migration period, available once 10 Month supply is full."
  }
};

export const YThorPhaseConfig: Record<
  YThorPhase,
  { key: YThorPhase; lockDuration: string; description: string }
> = {
  "4Y": {
    key: "4Y",
    lockDuration: "4 years",
    description: "4-year cliff with linear vesting"
  }
};

export const YThorContributorsConfig: Record<
  YThorPhase,
  { key: YThorPhase; lockDuration: string; description: string }
> = {
  "4Y": {
    key: "4Y",
    lockDuration: "4 years",
    description: "4-year cliff with linear vesting"
  }
};
