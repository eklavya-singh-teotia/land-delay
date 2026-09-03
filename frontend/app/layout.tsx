import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-[#F5F7FA] text-[#1A1A1A] antialiased" suppressHydrationWarning>
        <QueryProvider>
          <Navbar />
          <Sidebar />
          <main className="main-content">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
