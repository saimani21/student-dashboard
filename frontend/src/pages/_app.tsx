import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="premium-bg min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 container-center">
          <div className="content-wrapper">
            <Component {...pageProps} />
          </div>
        </main>
      </div>
    </div>
  )
}
