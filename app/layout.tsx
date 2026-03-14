import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/lib/useAuth'
import { Toaster } from "sonner";
import { Cinzel,Varela_Round,Satisfy,Titan_One } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
export const cinzel = Cinzel({ subsets: ['latin'] })
export const varela_round = Varela_Round({ subsets: ['latin-ext'], weight: "400", })
export const satisfy = Satisfy({ subsets: ["latin"] , weight: "400",})
export const titan_one = Titan_One({ subsets: ["latin"] , weight: "400",})
 const metadata: Metadata = {
  title: 'OTT Platform',
  description: 'Modern OTT streaming platform with immersive experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
     <head>
       <meta name="mobile-web-app-capable" content="yes"/> 
<meta name="apple-mobile-web-app-capable" content="yes"/> 
<meta name="apple-mobile-web-app-status-bar-style" content="black" /> 
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="theme-color" content="#111827"/> 
<link rel="manifest" href="/manifest.json" />


     </head>

      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col ">
            {/* <Navbar /> */}
            <main className="flex-1">
              
      <Toaster richColors position="top-right" />
              {children}
            </main>
          {/* <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">OTT Platform</h3>
                  <p className="text-gray-400 text-sm">
                    Experience entertainment like never before with immersive content and cutting-edge technology.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Explore</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="/admin" className="hover:text-white transition">Home</a></li>
                    <li><a href="/premiere" className="hover:text-white transition">Premiere</a></li>
                    <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                    <li><a href="/plans" className="hover:text-white transition">Plans</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                    <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
                    <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Legal</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                <p>&copy; 2025 OTT Platform. All rights reserved.</p>
              </div>
            </div>
          </footer> */}
          </div>
        </AuthProvider>
      </body>
      
    </html>
  )
}
