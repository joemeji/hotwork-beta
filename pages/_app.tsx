import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react";
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from "@/components/ui/toaster";
import { argbFromHex, themeFromSourceColor, applyTheme } from "@material/material-color-utilities";

if (typeof window !== "undefined") {
  const theme = themeFromSourceColor(argbFromHex('#f82506'), [
    {
      name: "custom-1",
      value: argbFromHex("#ff0000"),
      blend: true,
    },
  ]);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(theme, {target: document.body, dark: systemDark});
}

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