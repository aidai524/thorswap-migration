import { mainnet, base, type Chain } from "wagmi/chains";

// Custom Base chain with specified RPC URL
const baseChain: Chain = {
  ...base,
  rpcUrls: {
    default: {
      http: ["https://base-mainnet.g.alchemy.com/v2/i-czB6mQvrz3RVMB6zItL"]
    },
    public: {
      http: ["https://base-mainnet.g.alchemy.com/v2/i-czB6mQvrz3RVMB6zItL"]
    }
  }
};

export default [mainnet, baseChain] as Chain[];
