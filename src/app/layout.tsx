import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import TRPCProvider from '@/providers/TRPCProvider';
import NextTopLoader from "nextjs-toploader"

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >

        <AntdRegistry>
          <NextTopLoader color="#1677ff" showSpinner={false} />
          <TRPCProvider>{children}</TRPCProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
