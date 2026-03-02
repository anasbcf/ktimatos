import { submitLeadAction } from '../app/actions/leads';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function diagnose() {
    console.log('[Diagnostic] Executing submitLeadAction directly...');

    // Polyfill FormData for Node.js if needed (Node 18+ has it built-in)
    const formData = new FormData();
    formData.append('full_name', 'Direct Diagnostic');
    formData.append('email', `diag_${Date.now()}@example.com`);
    formData.append('agency_name', 'Diag Agency');
    formData.append('agents_count', '1-5');
    formData.append('language', 'English');
    formData.append('phone', `+35799${Date.now().toString().slice(-6)}`);

    try {
        const result = await submitLeadAction(formData);
        console.log('[Diagnostic] Result:', result);
    } catch (e) {
        console.error('[Diagnostic] Unhandled Exception Caught:');
        console.error(e);
    }
}

diagnose();
