"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";
import Image from "next/image";
import logoImg from "@/assets/images/logo.png";
import SessionManager from "./session-manager";

const Logo = <Image src={logoImg} alt="logo" width={40} height={40} />;

export function Providers({ children }: { children: ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#1db584",
          logo: Logo,
        },
        loginMethods: ["wallet", "email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [
          {
            id: 42220,
            name: "Celo",
            network: "celo",
            nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
            rpcUrls: { default: { http: ["https://forno.celo.org"] } },
          },
          {
            id: 44787,
            name: "Alfajores",
            network: "alfajores",
            nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
            rpcUrls: {
              default: {
                http: ["https://alfajores-forno.celo-testnet.org"],
              },
            },
          },
          {
            id: 8453,
            name: "Base",
            network: "base",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
          },
          {
            id: 43114,
            name: "Avalanche",
            network: "avalanche",
            nativeCurrency: {
              name: "AVAX",
              symbol: "AVAX",
              decimals: 18,
            },
            rpcUrls: {
              default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
            },
          },
        ],
      }}
    >
      <SessionManager />
      {children}
    </PrivyProvider>
  );
}
