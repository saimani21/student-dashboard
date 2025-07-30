import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 main-container">
          <div className="content-wrapper">
            <Component {...pageProps} />
          </div>
        </main>
      </div>
    </div>
  )
}
