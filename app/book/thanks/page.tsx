'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, CalendarDays, ArrowLeft, ArrowRight, Video } from 'lucide-react'
import { Suspense } from 'react'

function ThanksContent() {
    const searchParams = useSearchParams()

    // Safely parse forwarded params from Cal.com
    const name = searchParams ? searchParams.get('name') : null;
    const email = searchParams ? searchParams.get('email') : null;
    const date = searchParams ? searchParams.get('date') : null;

    // Convert ISO date from Cal.com to readable format if present
    let formattedDate = null;
    if (date) {
        try {
            formattedDate = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(new Date(date));
        } catch (e) {
            formattedDate = date; // fallback if parse fails
        }
    }

    return (
        <div className="max-w-xl w-full mx-auto relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 py-12 px-6 mt-16 text-center">

            <div className="w-20 h-20 rounded-full bg-[#1A1C23] border border-gray-800 flex items-center justify-center mx-auto shadow-2xl relative mb-8">
                <div className="absolute inset-0 rounded-full border border-green-500/30 animate-pulse opacity-50"></div>
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    {name ? `Booking Confirmed, ${name.split(' ')[0]}!` : 'Booking Confirmed!'}
                </h1>
                <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
                    Your White-Glove setup evaluation session is successfully scheduled.
                </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-[#111216] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative text-left p-6 sm:p-8 mt-10">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30 left-0" />

                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Session Details
                </h3>

                <div className="space-y-5">
                    {formattedDate && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Time & Date</p>
                            <p className="text-lg font-medium text-white">{formattedDate}</p>
                        </div>
                    )}

                    {email && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Calendar Invite Sent To</p>
                            <p className="text-gray-300 font-mono text-sm">{email}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-800/60 mt-4">
                        <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 flex items-start gap-4">
                            <Video className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-blue-400 font-medium text-sm mb-1">Google Meet Required</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    The meeting link is attached to your calendar invite. Please join from a computer to screen-share if necessary.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10">
                <Link href="/" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors group text-sm">
                    Return to Homepage
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}

export default function BookThanksPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] relative flex flex-col font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0C10] via-[#11131A] to-green-900/5 opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-green-500/5 blur-[120px] pointer-events-none rounded-full" />

            <header className="absolute top-0 w-full p-6 z-20">
                <Link href="/" className="flex items-center gap-2 group">
                    <img
                        src="/logotipo.png"
                        alt="KtimatOS Logo"
                        className="h-9 w-auto group-hover:opacity-80 transition-opacity mx-auto md:mx-0"
                    />
                </Link>
            </header>

            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                </div>
            }>
                <ThanksContent />
            </Suspense>
        </div>
    )
}
