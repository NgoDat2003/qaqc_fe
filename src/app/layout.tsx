import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "QualityOps | F&B Audit Platform",
  description: "End-to-end quality audit management for multi-brand F&B operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased " suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
