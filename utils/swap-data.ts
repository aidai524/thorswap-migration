import { ethers } from "ethers";

/**
 * swapData = abi.encode(uint8 dexType, bytes pathData)
 *
 * dexType:
 * - 0: Uniswap V2 (pathData = abi.encode(address[] path))
 * - 1: Uniswap V3 (pathData = packed path bytes)
 *
 * Constraints (validated by contract):
 * - tokenIn of path must be USDC (rewardToken)
 * - tokenOut of path must be METRO
 */

/* ------------------------- V2 (Uniswap V2 Router02) ------------------------- */
export function buildSwapDataV2(params: {
  path: string[]; // Example: [USDC, METRO] or [USDC, WETH, METRO]
}): string {
  const abi = ethers.AbiCoder.defaultAbiCoder();

  // pathData = abi.encode(address[] path)
  const pathData = abi.encode(["address[]"], [params.path]);

  // swapData = abi.encode(uint8 dexType, bytes pathData)
  return abi.encode(["uint8", "bytes"], [0, pathData]); // 0 = DEX_V2
}

/* ------------------------- V3 (Uniswap SwapRouter02) ------------------------- */
/**
 * Packed path format (Uniswap V3 style):
 * path = tokenIn(20 bytes) + fee(uint24, 3 bytes) + tokenOut(20 bytes) [+ fee + token ...]
 */
export function buildSwapDataV3SingleHop(params: {
  tokenIn: string; // USDC
  tokenOut: string; // METRO
  fee: number; // uint24, common values: 100/500/3000/10000
}): string {
  const abi = ethers.AbiCoder.defaultAbiCoder();

  const pathData = ethers.solidityPacked(
    ["address", "uint24", "address"],
    [params.tokenIn, params.fee, params.tokenOut]
  );

  return abi.encode(["uint8", "bytes"], [1, pathData]); // 1 = DEX_V3
}

export function buildSwapDataV3MultiHop(params: {
  tokens: string[]; // [USDC, tokenMid, METRO]
  fees: number[]; // [fee0, fee1] each uint24
}): string {
  if (params.tokens.length !== params.fees.length + 1)
    throw new Error("bad tokens/fees");

  const firstTokenBytes = ethers.getBytes(
    ethers.solidityPacked(["address"], [params.tokens[0]])
  );
  let bytes: Uint8Array = firstTokenBytes;
  for (let i = 0; i < params.fees.length; i++) {
    const hop = ethers.getBytes(
      ethers.solidityPacked(
        ["uint24", "address"],
        [params.fees[i], params.tokens[i + 1]]
      )
    );
    // Concatenate Uint8Arrays
    const combined = new Uint8Array(bytes.length + hop.length);
    combined.set(bytes, 0);
    combined.set(hop, bytes.length);
    bytes = combined;
  }

  const abi = ethers.AbiCoder.defaultAbiCoder();
  return abi.encode(["uint8", "bytes"], [1, ethers.hexlify(bytes)]); // 1 = DEX_V3
}
