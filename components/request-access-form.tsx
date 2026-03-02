'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Loader2, ArrowRight, Edit2 } from 'lucide-react'
import { submitLeadAction } from '@/app/actions/leads'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export function RequestAccessForm() {
    const router = useRouter()

    // Controlled Form State
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [agencyName, setAgencyName] = useState('')
    const [agentsCount, setAgentsCount] = useState('1-5')
    const [language, setLanguage] = useState('English')
    const [phone, setPhone] = useState<string | undefined>()
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    // UI State
    const [isConfirming, setIsConfirming] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Derived State
    const SUPPORTED_PREFIXES = ['+357', '+30', '+44', '+7', '+972', '+1', '+971']
    const isSupportedPrefix = phone ? SUPPORTED_PREFIXES.some(prefix => phone.startsWith(prefix)) : false

    function handleInitialSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!fullName || !email || !agencyName || !phone) {
            toast.error("Please fill in all fields.")
            return
        }

        if (!isValidPhoneNumber(phone)) {
            toast.error("Please enter a valid phone number.")
            return
        }

        if (!acceptedTerms) {
            toast.error("You must accept the terms and privacy policy.")
            return
        }

        // Transition to confirmation state instead of submitting
        setIsConfirming(true)
    }

    async function handleFinalSubmit() {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('full_name', fullName)
            formData.append('email', email)
            formData.append('agency_name', agencyName)
            formData.append('agents_count', agentsCount)
            formData.append('language', language)
            formData.append('phone', phone || '')

            const result = await submitLeadAction(formData)

            if (result?.error) {
                toast.error(result.error)
                setIsConfirming(false) // Let them edit if there's an error
            } else if (result?.redirect) {
                router.push(result.redirect)
            } else {
                router.push('/thanks')
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
            setIsConfirming(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-px rounded-2xl bg-gradient-to-b from-gray-700 via-gray-800 to-black relative shadow-2xl shadow-yellow-900/20">
            <Card className="bg-[#0B0C10] border-black overflow-hidden relative rounded-[15px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0C10] via-gray-900 to-[#1A1A1A] pointer-events-none opacity-50" />

                <CardHeader className="space-y-1 pb-6 pt-8 relative z-10 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-white">Partnership Access</CardTitle>
                    <CardDescription className="text-gray-400 font-medium text-sm max-w-xs mx-auto">
                        Tailored for ambitious agencies in Limassol & Paphos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pb-8 px-6 sm:px-8">
                    {/* The Form (Hidden if confirming) */}
                    <form onSubmit={handleInitialSubmit} className={`space-y-5 transition-all duration-300 ${isConfirming ? 'hidden opacity-0' : 'block opacity-100'}`}>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Andreas M."
                                required
                                className="bg-[#111216] border-gray-800 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 h-12 transition-all rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Work Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="andreas@agency.com.cy"
                                required
                                className="bg-[#111216] border-gray-800 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 h-12 transition-all rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Agency Name</label>
                            <Input
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="Luxury Estates Cyprus"
                                required
                                className="bg-[#111216] border-gray-800 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 h-12 transition-all rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Team Size</label>
                                <Select value={agentsCount} onValueChange={setAgentsCount}>
                                    <SelectTrigger className="bg-[#111216] border-gray-800 text-white focus:ring-1 focus:ring-yellow-500/50 h-12 rounded-lg">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111216] text-white border-gray-800">
                                        <SelectItem value="1-5">1-5</SelectItem>
                                        <SelectItem value="5-10">5-10</SelectItem>
                                        <SelectItem value="10+">10+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Language</label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="bg-[#111216] border-gray-800 text-white focus:ring-1 focus:ring-yellow-500/50 h-12 rounded-lg">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111216] text-white border-gray-800">
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Greek">Greek</SelectItem>
                                        <SelectItem value="Russian">Russian</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">WhatsApp Number</label>
                            <div className="bg-[#111216] border border-gray-800 focus-within:ring-1 focus-within:ring-yellow-500/50 focus-within:border-yellow-500/50 transition-all rounded-lg flex items-center px-3 h-12 ktimatos-phone-input">
                                <PhoneInput
                                    international
                                    defaultCountry="CY"
                                    countries={['CY', 'GR', 'GB', 'RU', 'IL', 'US', 'AE']}
                                    value={phone}
                                    onChange={setPhone}
                                    className="w-full text-white bg-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-800 bg-[#111216] text-yellow-500 focus:ring-yellow-500/50"
                                required
                            />
                            <label htmlFor="terms" className="text-[12px] text-gray-400 leading-tight">
                                I agree to the <Link href="/terms" className="text-gray-300 underline cursor-pointer hover:text-white" target="_blank">Terms & Conditions</Link> and <Link href="/privacy" className="text-gray-300 underline cursor-pointer hover:text-white" target="_blank">Privacy Policy</Link>. I consent to receive an automated AI setup call.
                            </label>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-white hover:bg-gray-200 text-black font-bold h-12 text-[15px] transition-all transform hover:scale-[1.02] active:scale-[0.98] rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Confirmation State */}
                    <div className={`space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-right-4 ${isConfirming ? 'block' : 'hidden'}`}>
                        <div className="p-5 rounded-xl bg-yellow-950/20 border border-yellow-900/30 text-center space-y-3">
                            <h4 className="font-bold text-white text-lg">
                                {isSupportedPrefix ? "Verify your Number" : "Verify your Email"}
                            </h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {isSupportedPrefix ? "Is this your correct phone number?" : "Is this your correct email address?"} <br />
                                <span className="font-mono text-yellow-500 font-bold text-lg inline-block mt-2 tracking-wider">
                                    {isSupportedPrefix ? phone : email}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {isSupportedPrefix
                                    ? "Elena will call you here in less than 5 minutes to finalize your setup."
                                    : "Please confirm your email. You will be redirected to select your setup time."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-[#C5A880] to-[#E3CBA8] hover:to-white text-[#0B0C10] font-bold h-12 text-[16px] transition-all rounded-lg shadow-[0_0_20px_rgba(197,168,128,0.4)] hover:scale-[1.02]"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting Access...</>
                                ) : (
                                    "Confirm and Request Access"
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setIsConfirming(false)}
                                disabled={isSubmitting}
                                className="w-full text-gray-400 hover:text-white hover:bg-white/5 h-10"
                            >
                                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Details
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
