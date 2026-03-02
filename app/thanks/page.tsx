import { Sparkles } from "lucide-react"

export default function ThanksPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0C10] via-[#11131A] to-[#C5A880]/10 opacity-30 pointer-events-none" />

            <div className="max-w-xl w-full z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 py-12">
                <div className="text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-[#1A1C23] border border-gray-800 flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                        <div className="absolute inset-0 rounded-full border border-[#C5A880]/30 animate-ping opacity-50"></div>
                        <Sparkles className="w-8 h-8 text-[#C5A880]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Verification in Progress.</h1>
                    <p className="text-gray-400 text-lg mx-auto leading-relaxed max-w-sm">
                        We are currently reviewing your agency's data to ensure compatibility with KtimatOS.
                    </p>
                </div>

                <div className="bg-[#111216] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent opacity-30 left-0" />

                    <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-5 text-center">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            To maintain exclusivity, we manually verify all requests. <br className="hidden md:block" />
                            Our AI Assistant, Elena, will contact you shortly to finalize your White-Glove setup.
                        </p>
                        <p className="font-bold text-[#C5A880] mt-3 tracking-wide uppercase text-xs">
                            Please keep your line open.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
