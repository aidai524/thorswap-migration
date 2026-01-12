"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Network, WalletState, TransactionStatus } from "@/lib/types"
import { mockWalletBalance } from "@/lib/mock-data"

interface WalletContextType {
  wallet: WalletState
  txStatus: TransactionStatus
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (network: Network) => Promise<void>
  setTxStatus: (status: TransactionStatus) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: null,
    balance: {
      THOR: "0",
      yTHOR: "0",
      METRO: "0",
      USDC: "0",
    },
  })

  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: "idle" })

  const connect = useCallback(async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setWallet({
      connected: true,
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0D",
      network: "ethereum",
      balance: mockWalletBalance,
    })
  }, [])

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      network: null,
      balance: {
        THOR: "0",
        yTHOR: "0",
        METRO: "0",
        USDC: "0",
      },
    })
  }, [])

  const switchNetwork = useCallback(async (network: Network) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setWallet((prev) => ({ ...prev, network }))
  }, [])

  return (
    <WalletContext.Provider
      value={{
        wallet,
        txStatus,
        connect,
        disconnect,
        switchNetwork,
        setTxStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
