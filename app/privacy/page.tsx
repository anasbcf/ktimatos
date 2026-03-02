import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy - KtimatOS",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] selection:bg-yellow-900/40 selection:text-white font-sans antialiased py-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">Privacy Policy</h1>
                    <p className="text-gray-400">Compliance and Data Infrastructure under EU Standards</p>
                </div>

                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none space-y-6 mt-8">
                    <p>
                        At KtimatOS, accessible from our official domains and SaaS deployments, one of our main priorities is the privacy of our partner agencies and their investor leads.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
                    <p>
                        When you register for a KtimatOS Account as an Agency, we may ask for your commercial contact information, including items such as name, company name, address, email address, WhatsApp business number, and telephone number. Our platform processes your customers' metadata securely for your exclusive use.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">How we use your information</h2>
                    <p>
                        We use the information we collect in various ways, including to:
                    </p>
                    <ul className="list-disc pl-5 text-gray-400 space-y-2">
                        <li>Provide, operate, and maintain securely our Multi-Tenant AI Platform.</li>
                        <li>Automate AI communication through WhatsApp and Telephony endpoints (Meta and Telnyx infrastructures).</li>
                        <li>Communicate with you for urgent billing, technical interventions, and updates.</li>
                        <li>Track artificial intelligence metrics and wallet balances internally.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Strict Third-Party Privacy & GDPR</h2>
                    <p>
                        KtimatOS does not sell or distribute your B2B / B2C data. Your database architecture is strictly sequestered by your Organization ID (Tenant). Our language models (such as Google Gemini Pro) process audio and conversational text statelessly during real-time executions via encrypted APIs, without training algorithms on your private CRM logic.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Consent to Call</h2>
                    <p>
                        By checking the required box during onboarding, you expressly grant our AI Agent permission to dial the provided number to coordinate the White-Glove Setup via synthesized voice. You may revoke this consent directly via SMS or by rejecting the call visually.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
                    <p>
                        If you have any questions or require more information about our Privacy Policy or data residency, do not hesitate to contact our engineering team via the dashboard support channels.
                    </p>
                </div>
            </div>
        </div>
    );
}
