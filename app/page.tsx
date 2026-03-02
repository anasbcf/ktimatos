import { RequestAccessForm } from "@/components/request-access-form"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import {
    LayoutDashboard, CheckCircle2, BrainCircuit, Users, ShieldCheck,
    Check, X, ArrowRight, Zap, Database, Mic, PhoneCall, Crown, Search,
    CalendarDays, MessageSquare, MapPin, Sparkles, Network, ArrowUpRight,
    Headphones, FileAudio, ArrowDown
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] selection:bg-[#C5A880]/30 selection:text-white font-sans antialiased overflow-x-hidden">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <Image
                            src="/logotipo.png"
                            alt="KtimatOS Logo"
                            width={160}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <SignedIn>
                            <Link href="/dashboard" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors shadow-lg">
                                Dashboard <LayoutDashboard className="ml-2 w-4 h-4 text-[#C5A880]" />
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <Link href="/sign-in" className="hidden sm:inline-block text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Partner Login
                            </Link>
                            <a href="#partnership" className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#0B0C10] bg-gradient-to-r from-[#C5A880] to-[#E3CBA8] hover:to-white rounded-lg shadow-[0_0_20px_rgba(197,168,128,0.4)] transition-all hover:scale-105">
                                Request Access
                            </a>
                        </SignedOut>
                    </div>
                </div>
            </nav>

            {/* 1. HERO SECTION */}
            <main className="relative pt-[70px] sm:pt-[90px] pb-12 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto z-10 flex flex-col justify-center min-h-[90vh] lg:min-h-[85vh]">
                {/* Immersive glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5A880]/15 rounded-full blur-[150px] -z-10 pointer-events-none" />
                <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1] sm:leading-[1.05]">
                            The Agentic AI <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] via-[#E3CBA8] to-white">
                                That Actually Runs Your Agency.
                            </span>
                        </h1>

                        <div className="space-y-4 max-w-2xl mx-auto lg:mx-0">
                            <p className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Automate the chase. Control the close.
                            </p>
                            <div className="space-y-3">
                                <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                                    From qualifying inbound leads on WhatsApp to negotiating complex agent queries via voice, KtimatOS does 90% of the heavy lifting.
                                </p>
                                <p className="text-base sm:text-lg font-medium text-white/90">
                                    You maintain absolute control over the final handshake.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1 max-w-xl mx-auto lg:mx-0 text-left">
                            {[
                                { text: "Agent-Mediated Control", sub: "The AI filters and proposes options. You click 'Approve'.", icon: <ShieldCheck className="w-5 h-5 text-[#C5A880]" /> },
                                { text: "Dual-Brain Intelligence", sub: "AI for clients, Assistant for agents.", icon: <BrainCircuit className="w-5 h-5 text-[#C5A880]" /> },
                                { text: "Voice-Command Architecture", sub: "Manage operations just by talking to your AI assistant.", icon: <Mic className="w-5 h-5 text-[#C5A880]" /> },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#C5A880]/20 to-transparent border border-[#C5A880]/20 shrink-0 shadow-inner">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold flex items-center gap-2 text-[15px] leading-tight mb-1">{item.text}</p>
                                        <p className="text-gray-400 text-xs leading-tight">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
                            <a href="#partnership" className="inline-flex items-center justify-center px-6 py-3.5 text-[15px] font-bold text-[#0B0C10] bg-gradient-to-r from-[#C5A880] to-[#E3CBA8] hover:to-white rounded-xl shadow-[0_0_30px_rgba(197,168,128,0.3)] transition-all hover:scale-[1.03] group w-full sm:w-auto">
                                Request Private Access
                                <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </a>
                        </div>
                    </div>

                    {/* Right: The UI Mockup */}
                    <div className="relative mx-auto w-full max-w-[280px] perspective-1000 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 mt-12 lg:mt-0">
                        {/* Dynamic Floating Elements - Hidden on small screens to avoid overflow */}
                        <div className="absolute -left-[140px] sm:-left-[180px] top-20 bg-white/5 border border-white/10 p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 animate-bounce hidden lg:flex items-center h-[96px]" style={{ animationDuration: '6s' }}>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shrink-0"><Users className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[12px] font-bold text-white tracking-wide">New Lead</p>
                                    <div className="text-[9px] text-gray-300 mt-0.5 leading-snug">
                                        <p><span className="text-gray-500">Lang:</span> EN • <span className="text-gray-500">City:</span> Paphos</p>
                                        <p><span className="text-gray-500">Budget:</span> €1.5M • <span className="text-gray-500">Ref:</span> 43592</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-[140px] sm:-right-[180px] bottom-40 bg-white/5 border border-white/10 p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 animate-bounce hidden lg:flex items-center h-[96px]" style={{ animationDuration: '6s' }}>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880] border border-[#C5A880]/30 shrink-0"><CalendarDays className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[12px] font-bold text-white tracking-wide">Calendar Sync</p>
                                    <p className="text-[10px] text-[#C5A880] mt-0.5">Confirming availability...</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Bezel */}
                        <div className="relative bg-zinc-950 rounded-[3rem] p-2.5 border-[2px] border-zinc-800 shadow-2xl transform shadow-black/80 ring-[6px] ring-zinc-900/50 overflow-hidden">
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-full z-30 shadow-inner flex items-center justify-between px-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800/50"></div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Screen */}
                            <div className="h-[540px] w-full bg-[#0B141A] rounded-[2.4rem] overflow-hidden relative flex flex-col border border-gray-800/50">
                                {/* WhatsApp Dark Mode Doodles Background */}
                                <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-1.85 1.853L51.754 0h2.873zM5.373 0l-.83.83 1.85 1.853L8.246 0H5.373zM48.97 0h3.816l-3.23 3.23-1.46-1.46L48.97 0zm-37.94 0h-3.816l3.23 3.23 1.46-1.46L11.03 0zm27.946 0h-5.952l-2.022 2.023 2.87 2.87L38.976 0zM21.024 0h5.952l2.022 2.023-2.87 2.87L21.024 0zM0 5.372l.83-.83 1.853 1.85L0 8.246V5.372zm0 43.596l.83.83 1.853-1.85L0 46.09v2.878zm0-37.942v-3.816l3.23 3.23-1.46 1.46L0 11.026zm0 37.948v3.816l3.23-3.23-1.46-1.46L0 48.974zm0-27.95v-5.952l2.023-2.022 2.87 2.87L0 21.024zm0 17.952v5.952l2.023 2.022 2.87-2.87L0 38.976zM54.627 60l.83-.83-1.85-1.853L51.754 60h2.873zM5.373 60l-.83-.83 1.85-1.853L8.246 60H5.373zM48.97 60h3.816l-3.23-3.23-1.46 1.46L48.97 60zm-37.94 60h-3.816l3.23-3.23 1.46 1.46L11.03 60zm27.946 60h-5.952l-2.022-2.023 2.87-2.87L38.976 60zM21.024 60h5.952l2.022-2.023-2.87-2.87L21.024 60zM60 5.372l-.83-.83-1.853 1.85L60 8.246V5.372zm0 43.596l-.83.83-1.853-1.85L60 46.09v2.878zm0-37.942v-3.816l-3.23 3.23 1.46 1.46L60 11.026zm0 37.948v3.816l-3.23-3.23 1.46-1.46L60 48.974zm0-27.95v-5.952l-2.023-2.022-2.87 2.87L60 21.024zm0 17.952v5.952l-2.023 2.022-2.87-2.87L60 38.976zM30 25a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z\' fill=\'%231f2c34\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>

                                {/* WhatsApp Header */}
                                <div className="bg-[#1F2C34] w-full flex flex-col shrink-0 z-20 shadow-sm relative pt-1">
                                    {/* iOS Status Bar */}
                                    <div className="w-full h-11 flex items-center justify-between px-6">
                                        <span className="text-[#E9EDEF] text-[13px] font-semibold tracking-wide w-16 text-center">10:43</span>
                                        <div className="flex items-center gap-1.5 text-[#E9EDEF] w-16 justify-end">
                                            <div className="flex items-end gap-[1.5px] h-2.5 pb-[1px]">
                                                <div className="w-[3px] h-[4px] bg-[#E9EDEF] rounded-[1px]"></div>
                                                <div className="w-[3px] h-[6px] bg-[#E9EDEF] rounded-[1px]"></div>
                                                <div className="w-[3px] h-[8px] bg-[#E9EDEF] rounded-[1px]"></div>
                                                <div className="w-[3px] h-[10px] bg-[#E9EDEF] rounded-[1px]"></div>
                                            </div>
                                            <span className="text-[11px] font-bold tracking-widest ml-1">5G</span>
                                            <div className="flex items-center ml-1">
                                                <div className="w-[22px] h-[11px] border border-[#E9EDEF]/60 rounded-[4px] p-[1.5px] items-center justify-start flex">
                                                    <div className="bg-[#E9EDEF] h-[6px] w-[14px] rounded-[1.5px]"></div>
                                                </div>
                                                <div className="w-[1.5px] h-1.5 bg-[#E9EDEF]/60 rounded-r-[1px] ml-[1px]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="h-12 px-3 pb-2 flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#E9EDEF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                                <BrainCircuit className="w-4 h-4 text-[#E9EDEF]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[#E9EDEF] text-[13px] font-semibold leading-tight">"New lead"</span>
                                                <span className="text-[#8696A0] text-[10px] leading-tight">online</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#E9EDEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#E9EDEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2.5 z-10 w-full flex flex-col gap-2.5 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6 relative">

                                    {/* Chat 1: Inbound Lead */}
                                    <div className="bg-transparent p-0.5 flex flex-col gap-2.5">

                                        {/* Client Message 1 */}
                                        <div className="flex justify-start">
                                            <div className="bg-[#202C33] py-1.5 px-2.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative border border-white/5">
                                                <p className="text-[10px] text-[#E9EDEF] leading-[1.3] pr-6">Hi, is the beachfront villa still available? When can I see it?</p>
                                                <span className="text-[7px] text-[#8696A0] absolute bottom-1 right-2">10:41</span>
                                            </div>
                                        </div>

                                        {/* Engine Thought: DB Check */}
                                        <div className="flex justify-center my-1 w-full relative z-10">
                                            <div className="bg-[#182229] border border-[#2A3942] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-[0_1px_1px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                                                <Database className="w-[10px] h-[10px] text-[#00A884] animate-pulse" />
                                                <span className="text-[9px] text-[#8696A0] font-medium tracking-wide">System Check: Ref. 43592 Available</span>
                                            </div>
                                        </div>

                                        {/* AI Message 1 */}
                                        <div className="flex justify-end">
                                            <div className="bg-[#005C4B] py-1.5 px-2.5 rounded-2xl rounded-tr-sm max-w-[90%] shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative">
                                                <p className="text-[10px] text-[#E9EDEF] leading-[1.3] pr-10">Yes it is! Do you prefer morning or afternoon? I will confirm with Elena.</p>
                                                <div className="flex items-center gap-0.5 absolute bottom-1 right-2">
                                                    <span className="text-[7px] text-[#8696A0]">10:41</span>
                                                    <svg viewBox="0 0 16 15" width="12" height="11" fill="none" className="text-[#53bdeb]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client Message 2 */}
                                        <div className="flex justify-start">
                                            <div className="bg-[#202C33] py-1.5 px-2.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative border border-white/5">
                                                <p className="text-[10px] text-[#E9EDEF] leading-[1.3] pr-6">Afternoons work best.</p>
                                                <span className="text-[7px] text-[#8696A0] absolute bottom-1 right-2">10:42</span>
                                            </div>
                                        </div>

                                        {/* AI Message 2 */}
                                        <div className="flex justify-end relative">
                                            <div className="bg-[#D9FDD3] py-1.5 px-2.5 rounded-2xl rounded-tr-sm max-w-[90%] shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative border border-[#128C7E]/10">
                                                <p className="text-[10px] text-[#111B21] leading-[1.3] pr-10">Great! Let me confirm with Elena, the designated agent.</p>
                                                <div className="flex items-center gap-0.5 absolute bottom-1 right-2">
                                                    <span className="text-[7px] text-[#667781]">10:42</span>
                                                    <svg viewBox="0 0 16 15" width="12" height="11" fill="none" className="text-[#667781]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Multi-step Logic */}
                                    <div className="flex justify-center -my-2.5 invisible">
                                        <div className="h-0 w-[1px] bg-gray-300" />
                                    </div>

                                    <div className="relative mt-0.5">
                                        <div className="bg-[#182229] border border-[#2A3942] rounded-2xl p-3 shadow-lg relative overflow-hidden">

                                            <div className="flex flex-col gap-2 relative z-10">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-[#005C4B]/30 flex items-center justify-center">
                                                            <ShieldCheck className="w-3 h-3 text-[#00A884]" />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-[#E9EDEF] uppercase tracking-widest">KtimatOS Action Required</span>
                                                    </div>
                                                    <div className="w-2 h-2 rounded-full bg-[#00A884] animate-pulse shadow-[0_0_8px_rgba(0,168,132,0.6)]" />
                                                </div>

                                                {/* Content */}
                                                <div className="bg-[#111B21] rounded-xl p-2.5 border border-[#2A3942]">
                                                    <p className="text-[10px] text-[#8696A0] leading-[1.4]">
                                                        <span className="text-[#E9EDEF] font-semibold">Elena</span>, lead requests a viewing at <span className="text-[#E9EDEF] font-semibold">Beachfront Villa</span>. Prefers afternoon. Slot open for <span className="text-[#E9EDEF] font-semibold flex items-center gap-1 pt-1"><CalendarDays className="w-2.5 h-2.5 text-[#00A884] inline" /> Tomorrow 4:00 PM</span>
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-between gap-2 mt-1">
                                                    <button className="flex-1 py-2 rounded-xl bg-[#00A884] text-[#111B21] text-[10px] font-bold shadow-sm hover:bg-[#008f6f] transition-colors flex items-center justify-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-[#111B21] stroke-[3]" /> Approve
                                                    </button>
                                                    <button className="flex-1 py-2 rounded-xl bg-[#202C33] border border-[#2A3942] text-[#8696A0] text-[10px] font-semibold hover:bg-[#2A3942] transition-colors flex items-center justify-center gap-1.5 hover:text-[#E9EDEF]">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Learn More Sutil */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-[1500ms]">
                    <a href="#core-engine" className="group flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-500 group-hover:text-[#C5A880] transition-colors duration-300 mb-1">Learn More</span>
                        <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#C5A880]/30 group-hover:bg-[#C5A880]/5 transition-all duration-300 shadow-xl">
                            <ArrowDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#C5A880] transition-colors duration-300" />
                        </div>
                    </a>
                </div>
            </main>

            {/* 2. THE CORE ENGINE (Database) */}
            <section id="core-engine" className="py-16 sm:py-24 bg-[#111216] relative overflow-hidden border-y border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A880]/5 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-sm font-semibold mb-2">
                            <Database className="w-4 h-4" /> The Foundation
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">One Master Brain. <br className="sm:hidden" /><span className="text-gray-500">Infinite Capacity.</span></h2>
                        <div className="text-base sm:text-lg text-gray-400 space-y-3 sm:space-y-4">
                            <p>A centralized database of Clients, Agents, Calendars, Viewings, and Properties.</p>
                            <p>You integrate a property with a simple link, and the AI instantaneously ingests all its data.</p>
                            <p>The deeper your filters, the more powerfully the AI sells.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-3xl bg-[#1A1A24] border border-white/5 shadow-xl group hover:border-[#C5A880]/30 transition-all">
                            <Users className="w-8 h-8 text-[#C5A880] mb-5" />
                            <h3 className="text-xl font-bold text-white mb-2">Omniscient Profiles</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Fully GDPR-compliant. Every preference, budget update, and rejected property is logged. The AI knows exactly what your clients want.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-[#1A1A24] border border-white/5 shadow-xl group hover:border-[#C5A880]/30 transition-all">
                            <MapPin className="w-8 h-8 text-[#C5A880] mb-5" />
                            <h3 className="text-xl font-bold text-white mb-2">1-Click Prop Sync</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Paste a link from your portal. Our AI scrapes the specs, photos, and location, instantly adding it to its sales arsenal, ready to be pitched 24/7.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-[#1A1A24] border border-white/5 shadow-xl group hover:border-[#C5A880]/30 transition-all">
                            <CalendarDays className="w-8 h-8 text-[#C5A880] mb-5" />
                            <h3 className="text-xl font-bold text-white mb-2">Dynamic Calendars</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">The AI has full access to every agent's schedule. It resolves double-bookings, manages delays, and negotiates viewing times autonomously.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-[#1A1A24] border border-white/5 shadow-xl group hover:border-[#C5A880]/30 transition-all">
                            <ShieldCheck className="w-8 h-8 text-[#C5A880] mb-5" />
                            <h3 className="text-xl font-bold text-white mb-2">100% Data Ownership</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Your leads stay in your CRM, not on agents' personal WhatsApps. Even if an agent leaves the agency, you retain full control of the relationship.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. INBOUND OPERATIONS */}
            <section className="py-16 sm:py-24 bg-[#0B0C10] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-2">
                            <Headphones className="w-4 h-4" /> The Omnipresent Receptionist
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Flawless Inbound Routing.</h2>
                        <p className="text-base sm:text-lg text-gray-400">Whether they want a specific villa or just want to explore, the AI mediates the first touchpoint, requiring only a simple "OK" from your agents.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Specific Property Inquiry */}
                        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#1A1C23] to-[#0d0e12] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/10 transition-colors" />
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Search className="w-6 h-6 text-blue-400" />
                                Exact Property Inquiries
                            </h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Lead asks about Villa #24. The AI resolves doubts based on its data, and asks for scheduling preferences (morning/afternoon). Only once the agent clicks 'Approve' does the AI propose an exact time to the client.
                            </p>

                            {/* Visual Representation */}
                            <div className="bg-[#0B0C10]/80 rounded-2xl p-4 border border-white/5 space-y-2.5 h-[280px] flex flex-col justify-end">
                                <div className="flex gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-blue-900/30 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-blue-400" /></div>
                                    <div className="bg-white/5 p-2.5 rounded-xl rounded-tl-none border border-white/5 max-w-[85%]">
                                        <p className="text-[11px] text-gray-300 leading-snug">Does this villa have covered parking? When can I see it?</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 flex-row-reverse">
                                    <div className="w-7 h-7 rounded-full bg-[#1C1C1E] flex items-center justify-center shrink-0 border border-gray-700/50"><BrainCircuit className="w-3.5 h-3.5 text-blue-400" /></div>
                                    <div className="bg-[#1C1C1E] p-2.5 rounded-xl rounded-tr-none border border-gray-700 w-[80%]">
                                        <p className="text-[11px] text-gray-300 leading-snug">Yes, it has a 2-car garage! Would you prefer morning or afternoon?</p>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-2 w-full">
                                    <div className="bg-gradient-to-r from-[#1C1C1E] to-[#1A1A24] rounded-xl p-3 border border-gray-700/60 w-[95%] shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-[20px] -z-10" />
                                        <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">AI Agent Setup Loop</span>
                                        </div>
                                        <div className="space-y-2.5">
                                            <div className="flex items-start gap-1.5">
                                                <CalendarDays className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px" />
                                                <p className="text-[11px] text-gray-300 leading-tight"><strong>Agent Queried:</strong> Elena notified for availability.</p>
                                            </div>
                                            <div className="bg-[#0B0C10] p-2 rounded-lg border border-blue-500/20 flex items-center gap-2 justify-between">
                                                <span className="text-[10px] text-blue-400 flex items-center gap-1.5 font-medium"><ShieldCheck className="w-3 h-3" /> Pending Agent Approval</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* General Search Inquiry */}
                        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#1A1C23] to-[#0d0e12] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#C5A880]/10 transition-colors" />
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-[#C5A880]" />
                                Vague / General Searches
                            </h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Lead says: "I need a flat under €400k". The AI creates a profile, extracts preferences, filtering hundreds of database entries instantly. It pitches the top 3 options, gets a selection, and schedules the viewing autonomously.
                            </p>

                            {/* Visual Representation */}
                            <div className="bg-[#0B0C10]/80 rounded-2xl p-4 border border-white/5 space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-purple-400" /></div>
                                    <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                                        <p className="text-xs text-gray-300">Looking for 2 beds, sea view, max €500k.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-[#C5A880]/20 flex items-center justify-center shrink-0"><BrainCircuit className="w-4 h-4 text-[#C5A880]" /></div>
                                    <div className="bg-[#1C1C1E] p-3 rounded-xl rounded-tr-none border border-gray-700">
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-300">I found 2 perfect matches. Sent brochures.</p>
                                            <div className="flex gap-2">
                                                <div className="px-2 py-1 bg-[#C5A880]/10 text-[#C5A880] text-[10px] rounded border border-[#C5A880]/20">Aura Sky 2B (€480k)</div>
                                                <div className="px-2 py-1 bg-[#C5A880]/10 text-[#C5A880] text-[10px] rounded border border-[#C5A880]/20">Marina View (€495k)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. AGENTIC WORKFLOWS (The Magic) */}
            <section className="py-16 sm:py-24 bg-[#111216] relative border-y border-white/5 overflow-hidden">
                <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A880]/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-2">
                            <BrainCircuit className="w-4 h-4" /> Multi-Step Agentic Reasoning
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">The Operational Magic.</h2>
                        <p className="text-base sm:text-lg text-gray-400">Not just chatbots. These are chained, logical AI actions that execute entire business workflows based on simple WhatsApp voice notes.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Feature 1: Voice Note Operations */}
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-[#1A1C23] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <div className="md:w-1/2 space-y-6">
                                <div className="w-12 h-12 rounded-xl bg-[#C5A880]/10 flex items-center justify-center border border-[#C5A880]/20">
                                    <FileAudio className="w-6 h-6 text-[#C5A880]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Post-Visit Auto-Rebound</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    After a visit, your agent records a 10-second WhatsApp audio. If the client didn't like it because it's too small, the AI updates their CRM profile, adjusts budget to find larger homes, and instantly texts the lead 3 new alternatives, asking when they want to view them.
                                </p>
                                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> <strong>Reserved Property trigger:</strong> AI automatically cascades WhatsApp apologies to other pending leads, offering them alternatives.
                                </p>
                            </div>
                            <div className="md:w-1/2 w-full bg-[#0B0C10] rounded-3xl p-6 border border-white/5 relative">
                                <div className="absolute -left-3 top-1/3 bg-green-500/90 text-white text-[10px] px-2 py-1 rounded-full shadow-lg font-bold flex items-center gap-1 z-10"><Mic className="w-3 h-3" /> Audio Processed</div>
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-start">
                                        <div className="bg-[#1C1C1E] border border-gray-700 p-3 rounded-2xl rounded-bl-none max-w-[80%]">
                                            <p className="text-[11px] text-gray-300 italic">"Client found it too small. They want 2 bathrooms. Budget up to €600k."</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="h-4 w-[1px] bg-gray-700 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0B0C10] p-1 rounded-full border border-gray-700 text-[#C5A880]"><BrainCircuit className="w-3 h-3" /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="bg-gradient-to-r from-[#C5A880]/10 to-transparent border border-[#C5A880]/20 p-3.5 rounded-2xl rounded-br-none max-w-[95%] space-y-3">
                                            <p className="text-[10px] text-[#C5A880] uppercase font-bold tracking-wider mb-1 border-b border-[#C5A880]/20 pb-1.5">Action Proposed:</p>
                                            <ul className="text-[11px] text-gray-300 space-y-2">
                                                <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#C5A880]/10 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-[#C5A880]" /></div> CRM preferences updated (2 Bath).</li>
                                                <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#C5A880]/10 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-[#C5A880]" /></div> Found 4 matches. Send them to lead?</li>
                                            </ul>
                                            <div className="pt-1.5 border-t border-[#C5A880]/10">
                                                <button className="w-full py-1.5 rounded-xl bg-[#C5A880]/20 text-[#C5A880] text-[10px] font-bold border border-[#C5A880]/30 hover:bg-[#C5A880]/30 transition-colors flex justify-center items-center gap-1.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Confirm & Send
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Complex Internal Operations */}
                        <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-[#1A1C23] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <div className="md:w-1/2 space-y-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                    <PhoneCall className="w-6 h-6 text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Complex Operational Q&A</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    The AI is your command center. Lost the keys to a villa? The agent messages the AI. The AI checks access logs, sees Elena had them last, asks permission to call her, makes the voice call autonomously, gets the answer, and relays the exact location back to the agent in seconds.
                                </p>
                            </div>
                            <div className="md:w-1/2 w-full bg-[#0B0C10] rounded-3xl p-6 border border-white/5">
                                <div className="space-y-4">
                                    <div className="bg-[#1C1C1E] p-3 rounded-lg border border-gray-800 flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 uppercase text-[10px] font-bold">You</div>
                                        <p className="text-[11px] text-gray-300">"I can't find the keys for Villa 24. Do you know where they are?"</p>
                                    </div>
                                    <div className="bg-[#1C1C1E] p-3 rounded-lg border border-[#C5A880]/30 flex gap-3 shadow-[0_0_15px_rgba(197,168,128,0.1)]">
                                        <div className="w-6 h-6 rounded-full bg-[#C5A880] text-[#0B0C10] flex items-center justify-center shrink-0"><BrainCircuit className="w-3 h-3" /></div>
                                        <div>
                                            <p className="text-[11px] text-white">"Elena had them yesterday at 4 PM. Should I call her to ask where she left them?"</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#1C1C1E] p-3 rounded-lg border border-gray-800 flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 uppercase text-[10px] font-bold">You</div>
                                        <p className="text-[11px] text-gray-300">"Yes, please."</p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-4 py-1">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        <p className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">AI Calling Elena...</p>
                                    </div>
                                    <div className="bg-[#1C1C1E] p-3 rounded-lg border border-green-500/30 flex gap-3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                        <div className="w-6 h-6 rounded-full bg-[#C5A880] text-[#0B0C10] flex items-center justify-center shrink-0"><BrainCircuit className="w-3 h-3" /></div>
                                        <p className="text-[11px] text-white">"She said they are in the glovebox of the company BMW in the north parking lot."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. VIP ROUTING */}
            <section className="py-16 sm:py-24 bg-[#0B0C10] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <Crown className="w-4 h-4" /> VIP Escort Protocol
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Never lose a whale.</h2>
                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                            Set your high-value threshold. If a lead enters with a budget over X millions, the standard AI qualification drops into "Concierge Mode". Operations are immediately transferred to Senior Agents or Directors for the closing touch.
                        </p>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl">
                                <Search className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Budget {'>'} €2.5M Detected</p>
                                <p className="text-xs text-gray-400">Action: Alert Director Mobile immediately.</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract visual */}
                    <div className="h-full min-h-[400px] rounded-3xl bg-gradient-to-br from-[#1C1C1E] to-[#0B0C10] border border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="relative z-10 w-48 h-48 rounded-full border border-yellow-500/30 flex items-center justify-center shadow-[0_0_100px_rgba(234,179,8,0.15)] bg-yellow-900/10">
                            <div className="w-32 h-32 rounded-full border border-yellow-500/50 flex items-center justify-center">
                                <Crown className="w-12 h-12 text-yellow-500" />
                            </div>
                        </div>
                        <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-4 px-10">
                            <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-yellow-500/50 rounded-full" />
                            <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-yellow-500/50 rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. COMING SOON - PLATFORM EXPANSION */}
            <section className="py-16 sm:py-24 bg-[#0B0C10] relative border-t border-white/5">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C5A880]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold mb-2 shadow-inner">
                            <Sparkles className="w-4 h-4 text-[#C5A880]" /> The Horizon Roadmap
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">An Ecosystem That Evolves.</h2>
                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                            KtimatOS is scaling. With Phase II, your AI doesn't just manage the sale, it sources the product and handles the downstream operations autonomously.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Market Sourcing */}
                        <div className="p-8 rounded-3xl bg-[#111216] border border-white/5 shadow-xl relative overflow-hidden group hover:border-[#C5A880]/30 transition-all flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C5A880]/20 to-transparent border border-[#C5A880]/20 flex items-center justify-center mb-6">
                                <Search className="w-6 h-6 text-[#C5A880]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Market Intelligence</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                Real-time autonomous scanning of the market for off-market opportunities, underpriced assets, and exclusive deals to funnel directly to your agents before anyone else sees them.
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-bold py-1 px-3 border border-[#C5A880]/20 rounded-full bg-[#C5A880]/5">Coming Soon</span>
                        </div>

                        {/* Legal Automation */}
                        <div className="p-8 rounded-3xl bg-[#111216] border border-white/5 shadow-xl relative overflow-hidden group hover:border-gray-500/30 transition-all flex flex-col items-center text-center mt-0 md:mt-8">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-500/20 to-transparent border border-gray-500/20 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Legal Automation</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                Seamless generation of reservation agreements, KYC/AML processing, and compliance documents directly via the AI, turning days of paperwork into seconds.
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold py-1 px-3 border border-white/10 rounded-full bg-white/5">Q4 Roadmap</span>
                        </div>

                        {/* Operational Integrations */}
                        <div className="p-8 rounded-3xl bg-[#111216] border border-white/5 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col items-center text-center mt-0 md:mt-8">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 flex items-center justify-center mb-6">
                                <Network className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Operational Triggers</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                The AI connects directly to cleaning services, maintenance crews, and professional photographers automatically based on move-in/out or "new listing" triggers.
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold py-1 px-3 border border-blue-500/20 rounded-full bg-blue-500/5">Planning Phase</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PARTNERSHIP & ACCESS */}
            <section id="partnership" className="py-20 sm:py-32 bg-[#111216] border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#C5A880]/10 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 sm:gap-16 items-center flex-wrap-reverse relative z-10">
                    <div className="space-y-8 text-center md:text-left">
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">Install Your AI.<br />Dominate Cyprus.</h2>
                            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg mx-auto md:mx-0">
                                KtimatOS is the ultimate competitive advantage for high-volume real estate teams. Request an invite, and we'll engineer the system around your exact workflows in 48 hours.
                            </p>
                        </div>

                        <div className="space-y-6 pt-4">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider text-sm">The Onboarding Process</h3>
                            <div className="space-y-5">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center font-mono text-sm shrink-0 mt-0.5">1</div>
                                    <div className="pt-1.5"><span className="font-bold text-white text-sm">Request Access:</span> <span className="text-gray-400 text-sm">Secure your spot.</span></div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center font-mono text-sm shrink-0 mt-0.5">2</div>
                                    <div className="pt-1.5"><span className="font-bold text-white text-sm">Architecture Call:</span> <span className="text-gray-400 text-sm">We map your processes and agent hierarchies.</span></div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] flex items-center justify-center font-mono text-sm shrink-0 mt-0.5 shadow-[0_0_10px_rgba(197,168,128,0.1)]">3</div>
                                    <div className="pt-1.5"><span className="font-bold text-[#C5A880] text-sm">White-Glove Setup:</span> <span className="text-[#C5A880]/80 text-sm">Your custom AI goes live in hours, not months.</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-md mx-auto xl:mr-0 drop-shadow-2xl">
                        <div className="rounded-[2.5rem] bg-[#0B0C10] border border-white/10 p-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E] to-[#111216] -z-10" />
                            <RequestAccessForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. FOOTER */}
            <footer className="bg-[#0B0C10] border-t border-white/5 py-8 sm:py-12 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#C5A880]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="mb-2">
                            <Image
                                src="/logotipo.png"
                                alt="KtimatOS"
                                width={120}
                                height={30}
                                className="object-contain opacity-80"
                            />
                        </div>
                        <p className="text-gray-600 text-[10px] sm:text-xs">Agentic AI for High-Performance Brokers.</p>
                    </div>
                    <p className="text-gray-600 text-[10px] sm:text-xs">
                        © {new Date().getFullYear()} KtimatOS. Engineered in Cyprus.
                    </p>
                    <div className="flex gap-6 text-[10px] sm:text-xs font-medium text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
