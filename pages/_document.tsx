import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className='scroll-smooth'>
      <Head />
      <body className='bg-gray-200 overflow-y-scroll'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
