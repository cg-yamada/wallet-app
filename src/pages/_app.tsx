import { MantineUIProvider } from "@/mantine"
import { WalletProvider } from "@/walletProvider"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <MantineUIProvider>
        <Component {...pageProps} />
      </MantineUIProvider>
    </WalletProvider>
  )
}
