"use client"

import { MantineProvider } from "@mantine/core"
import type { ReactNode } from "react"

// default
import "@mantine/core/styles.css"

// components
// import "@mantine/carousel/styles.css"
// import "@mantine/notifications/styles.css"

// original
// import "./styles/global.css"

/**
 * @see https://mantine.dev/theming/theme-object
 */
export const MantineUIProvider = ({ children }: { children: ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>
}
