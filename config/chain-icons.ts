/** Static chain icon paths under /public/chains (RainbowKit-style marks). */
const CHAIN_ICON_PATH: Record<number, string> = {
  1: "/chains/ethereum.svg",
  8453: "/chains/base.svg"
};

export function getChainIconPath(chainId: number): string | undefined {
  return CHAIN_ICON_PATH[chainId];
}
