import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/src/components/AuthProvider";
import ClientLayout from "@/src/components/ClientLayout"; // Import new client component

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
    description: "CloudPos - Sistema de Gestão de Vendas",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
            <ClientLayout>{children}</ClientLayout> {/* Use client component */}
        </AuthProvider>
        </body>
        </html>
    );
}
