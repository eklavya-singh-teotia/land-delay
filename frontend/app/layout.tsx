import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeSync } from "@/components/providers/ThemeSync";

export const metadata: Metadata = {
  title: "BhoomiSetu — Land Acquisition Delay Predictor",
  description: "Predicting land acquisition delays before they cost the project.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" data-theme="light" suppressHydrationWarning>
      <body className="h-full antialiased" suppressHydrationWarning>
        <ThemeSync />
        <QueryProvider>
          <Navbar />
          <Sidebar />
          <main className="main-content">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
