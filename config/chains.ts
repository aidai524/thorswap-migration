import { mainnet, base, type Chain } from "wagmi/chains";

// Custom Base chain with specified RPC URL
const baseChain: Chain = {
  ...base,
  rpcUrls: {
    default: {
      http: ["https://base.drpc.org"]
    },
    public: {
      http: ["https://base.drpc.org"]
    }
  }
};

export default [mainnet, baseChain] as Chain[];
