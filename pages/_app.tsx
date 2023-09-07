import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react";
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from "@/components/ui/toaster";

export default function App({ 
  Component, 
  pageProps : { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <NextNProgress color="#dc2626" />
      <Component {...pageProps} />
      <Toaster />
    </SessionProvider>
  );
}
