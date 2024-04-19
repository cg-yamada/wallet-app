import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { defaultWagmiConfig } from "@web3modal/wagmi"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import type { ReactNode } from "react"
import { polygon, polygonAmoy } from "viem/chains"
import { type State, WagmiProvider, cookieStorage, createStorage } from "wagmi"

// Get projectId at https://cloud.walletconnect.com
const projectId = "ddd705791e735d28580d1bc518dd0d39"

const queryClient = new QueryClient()

// export const wagmiConfig = createConfig({
//   chains: [polygonAmoy],
//   connectors: [injected()],
//   transports: {
//     [polygonAmoy.id]: http("https://amoy.g.mahola.xyz/v1/9iAnCG_5cjzsZGOAiMR-1RvddX6i4PA8"),
//   },
// })

const wagmiConfig = defaultWagmiConfig({
  chains: [polygon, polygonAmoy],
  projectId,
  metadata: {
    name: "sample",
    description: "sample wallet.",
    url: "https://sample.com",
    icons: ["https://sample.com/favicons/favicon.ico"],
  },
  ssr: true, // for hydration error
  storage: createStorage({ storage: cookieStorage }),
})

createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true,
  enableOnramp: false, // buy crypto
  themeMode: "dark",
})

interface Props {
  children: ReactNode
  initialState?: State
}

export function WalletProvider({ children, initialState }: Props) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
