"use client";

import { useState } from "react";
import { ArrowLeft, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("idle");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            company: formData.get("company"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setStatus("success");
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0B0C10] text-zinc-300 font-sans selection:bg-[#C5A880]/30 selection:text-white relative flex flex-col pt-12 sm:pt-16 h-full w-full">
            {/* Header */}
            <div className="absolute top-0 w-full z-50 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex flex-col md:flex-row gap-12 sm:gap-16 relative z-10 pt-20 sm:pt-24 pb-12">
                {/* Left Column: Info */}
                <div className="flex-1 space-y-8 text-center md:text-left">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Get in Touch</h1>
                        <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                            Ready to deploy the ultimate agentic intelligence in your real estate agency? Contact our team to request private access or discuss a custom integration.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-6 pt-4 items-center md:items-start justify-center">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-[#C5A880]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Email Us</p>
                                <a href="mailto:anas.b.k@ktimatos.com" className="text-white hover:text-[#C5A880] transition-colors font-semibold text-sm sm:text-base">anas.b.k@ktimatos.com</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-[#C5A880]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Call Us</p>
                                <a href="tel:+35799763682" className="text-white hover:text-[#C5A880] transition-colors font-semibold text-sm sm:text-base">+357 99763682</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="flex-1">
                    <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent"></div>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <input type="text" id="name" name="name" required disabled={isSubmitting} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-all disabled:opacity-50" placeholder="John Doe" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Work Email</label>
                                <input type="email" id="email" name="email" required disabled={isSubmitting} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-all disabled:opacity-50" placeholder="john@agency.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="company" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agency Name</label>
                                <input type="text" id="company" name="company" disabled={isSubmitting} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-all disabled:opacity-50" placeholder="KtimatOS Real Estate" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="message" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
                                <textarea id="message" name="message" required rows={4} disabled={isSubmitting} className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-all resize-none disabled:opacity-50" placeholder="Tell us about your operational challenges..."></textarea>
                            </div>

                            {status === "error" && (
                                <p className="text-red-400 text-sm font-medium">Something went wrong. Please try again or email us directly at anas.b.k@ktimatos.com.</p>
                            )}

                            {status === "success" ? (
                                <div className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm text-center">
                                    Message Sent Successfully. We'll be in touch!
                                </div>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E3CBA8] text-[#0B0C10] font-bold text-sm shadow-[0_0_20px_rgba(197,168,128,0.2)] hover:shadow-[0_0_30px_rgba(197,168,128,0.4)] hover:to-white transition-all transform hover:-translate-y-0.5 mt-2 flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
