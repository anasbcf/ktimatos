'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BookContent() {
    const searchParams = useSearchParams()

    // Fallback gracefully if searchParams isn't available during static prerendering
    const name = searchParams ? searchParams.get('name') : null;
    const email = searchParams ? searchParams.get('email') : null;

    let iframeUrl = "https://cal.com/anas-ktimatos/discovery?theme=dark";
    if (name) iframeUrl += `&name=${encodeURIComponent(name)}`;
    if (email) iframeUrl += `&email=${encodeURIComponent(email)}`;

    return (
        <div className="min-h-screen bg-[#0B0C10] text-gray-300 flex flex-col pt-12 md:pt-20">
            <div className="max-w-4xl mx-auto w-full px-6 flex-1">

                <header className="mb-8 text-center">
                    <Link href="/" className="inline-block group">
                        <img
                            src="/logotipo.png"
                            alt="KtimatOS Logo"
                            className="h-11 w-auto group-hover:opacity-80 transition-opacity mx-auto"
                        />
                    </Link>
                    <p className="text-gray-400 mt-2 text-[15px]">
                        Please select a time manually below.
                    </p>
                </header>

                <div className="bg-[#111216] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl min-h-[650px] relative">
                    {/* Placeholder loading state */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                        <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-3"></div>
                        <span className="text-gray-500 text-sm">Loading Secure Calendar...</span>
                    </div>

                    {/* 
                     * TO DO: Replace URL with your actual Cal.com embed link 
                     * Added ?theme=dark to force Cal.com into dark mode to match our UI
                     */}
                    <iframe
                        className="absolute inset-0 w-full h-full z-10"
                        src={iframeUrl}
                        title="KtimatOS Calendar Booking"
                    />
                </div>

                <div className="mt-8 text-center pb-12">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function BookFallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0C10] text-gray-300 flex flex-col pt-12 md:pt-20 items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
        }>
            <BookContent />
        </Suspense>
    )
}
