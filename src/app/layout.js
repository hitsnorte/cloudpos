import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/src/components/Layout/LayoutWrapper"; // Novo componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CloudPos",
  description: "CloudPos - Sistema de Gerenciamento de Vendas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
