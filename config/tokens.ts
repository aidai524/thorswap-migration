import type { Token } from "@/lib/types";

const ThorToken: Token = {
  symbol: "THOR",
  name: "THORSwap Token",
  decimals: 18,
  address: "0xD5e771e9CDE455B8d855D83a44670A2bD9b369eE",
  chainId: 8453,
  chainName: "Base",
  icon: "/tokens/thor.png"
};

const YThorToken: Token = {
  symbol: "yTHOR",
  name: "Vesting THOR",
  decimals: 18,
  address: "0x3d054D7a5eed98f03544e02ba9cd2934fC7befd0",
  chainId: 8453,
  chainName: "Base",
  icon: "/tokens/ythor.png"
};

const MetroToken: Token = {
  symbol: "METRO",
  name: "METRO Token",
  decimals: 18,
  address: "0xEBD847a7bAC2Bf0E00e8057Fed519b22b4598365",
  chainId: 8453,
  chainName: "Base",
  icon: "/tokens/metro.png"
};

const xMetroToken: Token = {
  symbol: "xMETRO",
  name: "xMETRO Token",
  decimals: 18,
  address: "0x4115105Bfa3fAE2C5306bFcFe86337846c83D068",
  chainId: 8453,
  chainName: "Base",
  icon: "/tokens/xmetro.png"
};

const RewardToken: Token = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: 18,
  address: "0x72742449CE7d19A1d3aEd5579795D70c4B23AAc0",
  chainId: 8453,
  chainName: "Base",
  icon: "/tokens/usdc.png"
};

export { ThorToken, YThorToken, MetroToken, xMetroToken, RewardToken };
