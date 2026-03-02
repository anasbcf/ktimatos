import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms and Conditions - KtimatOS",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] selection:bg-yellow-900/40 selection:text-white font-sans antialiased py-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">Terms and Conditions</h1>
                    <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none space-y-6">
                    <p>
                        Welcome to KtimatOS. These terms and conditions outline the rules and regulations for the use of our High-Performance Pipeline and AI Voice ecosystem, operating under the jurisdiction of the Republic of Cyprus and the European Union.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing this website and requesting access to our software, we assume you accept these terms and conditions. Do not continue to use KtimatOS if you do not agree to take all of the terms and conditions stated on this page.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. AI Telephony & Automated Systems</h2>
                    <p>
                        By submitting your phone number, you explicitly consent to receive an automated AI setup call from our system ("Elena" or similar voice profiles) to evaluate your agency's fit for our platform. We strictly adhere to EU Telephony standards.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Ownership & Privacy</h2>
                    <p>
                        KtimatOS operates as a B2B SaaS platform. Any leads or customer data processed through your instance of the KtimatOS platform belongs entirely to your agency. We do not sell, rent, or leak your private lead data to third parties. For more information, please read our Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Liability Limitations</h2>
                    <p>
                        Our AI models (including but not limited to Gemini, Llama, and ElevenLabs integrations) strive for maximum accuracy, however, we are not liable for business losses, deals falling through, or conversational hallucinations that may occur during automated workflows. Human supervision via the Admin Dashboard is required.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">5. Subscription & Billing</h2>
                    <p>
                        Use of the KtimatOS platform involves a flat monthly SaaS fee and variable costs tied to your AI Wallet consumption. Fees are non-refundable once the White-Glove Setup is completed.
                    </p>
                </div>
            </div>
        </div>
    );
}
