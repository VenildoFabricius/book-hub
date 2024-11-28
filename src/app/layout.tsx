import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Head from 'next/head';
import Footer from "@/components/footer";
import { Inter } from 'next/font/google';
import FontAwesomeConfig from "./fontawesome";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  weight: ['100', '400', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "BookHub",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;400;700&display=swap" rel="stylesheet" />
        <link href="/favicon.ico" rel="icon" />
        <FontAwesomeConfig />
      </Head>
      <body className={inter.className}>
        {children}
        <Footer />
        <Toaster position="top-right"/> 
      </body>
    </html>
  );
}
