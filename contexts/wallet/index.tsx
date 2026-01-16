"use client";

import React, { useContext } from "react";
import chains from "@/config/chains";
import {
  WagmiProvider,
  useAccount,
  useDisconnect,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
  cookieToInitialState,
  createConfig,
  http
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultConfig,
  useConnectModal
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  metaMaskWallet,
  coinbaseWallet,
  okxWallet,
  bitgetWallet,
  binanceWallet
} from "@rainbow-me/rainbowkit/wallets";
import { createClient } from "viem";

const projectId = process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID as string;
export const metadata = {
  name: "StableFlow.ai",
  description:
    "Topping up your Hyperliquid account made easy. Connect, choose, done. We handle the cross-chain magic so you don't have to.",
  // origin must match your domain & subdomain
  url: "https://app.stableflow.ai",
  icons: ["/logo.svg"]
};

// Singleton pattern to ensure config is only created once
let wagmiConfig: ReturnType<typeof createConfig> | null = null;
let queryClient: QueryClient | null = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    const config = getDefaultConfig({
      appName: metadata.name,
      appDescription: metadata.description,
      appUrl: metadata.url,
      appIcon: metadata.icons[0],
      projectId,
      chains: chains as any
    });
    const connectors: any = connectorsForWallets(
      [
        {
          groupName: "Recommended",
          wallets: [
            okxWallet,
            metaMaskWallet,
            coinbaseWallet,
            bitgetWallet,
            binanceWallet
          ]
        }
      ],
      {
        appName: metadata.name,
        projectId
      }
    );
    wagmiConfig = createConfig({
      ...config,
      connectors,
      client: ({ chain }) => {
        return createClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0])
        });
      }
    });
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient();
  }
  return queryClient;
}

export default function WalletProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const config = getWagmiConfig();
  const client = getQueryClient();
  const initialState = cookieToInitialState(config);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider modalSize="compact" locale="en-US">
          <Content>{children}</Content>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const { disconnect } = useDisconnect();
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChain: switchChainMutation, isPending } = useSwitchChain();

  const handleSwitchChain = (chainId: number) => {
    switchChainMutation({ chainId });
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        switchChain: handleSwitchChain,
        isSwitchingChain: isPending,
        walletClient,
        publicClient,
        disconnect,
        connect: openConnectModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = React.createContext<any | null>(null);

export function useWallet() {
  const context = useContext(AuthContext);

  return context || {};
}
