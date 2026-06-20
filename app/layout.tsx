import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "BankrollOS",
    template: "%s — BankrollOS",
  },
  description: "Gestión profesional de banca deportiva.",
  authors: [{ name: "Fidel Ernesto" }],
  openGraph: {
    title: "BankrollOS",
    description: "Gestión profesional de banca deportiva.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster theme="dark" position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
