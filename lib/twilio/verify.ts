
import { validateRequest } from 'twilio/lib/webhooks/webhooks';

export function verifyTwilioSignature(
    url: string,
    params: Record<string, any>,
    signature: string,
    authToken: string
): boolean {
    // In local development involving ngrok or similar, protocol headers might get mixed up (http vs https).
    // For production securely, strict validation is required.
    return validateRequest(authToken, signature, url, params);
}
