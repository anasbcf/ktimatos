require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function setupStorage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("🛠️ Setting up Supabase Storage...");

    // 1. Create Bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('voice-notes', {
        public: true,
        allowedMimeTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
        fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log("✅ Bucket 'voice-notes' already exists.");
        } else {
            console.error("❌ Error creating bucket:", bucketError.message);
        }
    } else {
        console.log("✅ Bucket 'voice-notes' created successfully.");
    }

    // 2. Update Profile with WhatsApp Number
    console.log("👤 Updating Profile with WhatsApp Number...");
    // Assuming the Super Admin is the one we want to notify
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({ whatsapp_number: 'whatsapp:+34617896422' })
        .eq('full_name', 'Super Admin')
        .select();

    if (profileError) {
        console.error("❌ Error updating profile:", profileError.message);
    } else {
        console.log("✅ Profile updated with WhatsApp Number:", profile[0]?.whatsapp_number);
    }
}

setupStorage();
