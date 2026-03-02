
// Script to simulate a Twilio Webhook POST request to our local API
const API_ENDPOINT = "http://localhost:3000/api/webhooks/twilio";

async function runTest() {
    console.log(`Simulating Twilio Webhook to: ${API_ENDPOINT}`);

    const formData = new URLSearchParams();
    formData.append('From', 'whatsapp:+35799000000');
    formData.append('Body', 'Hello, I am interested in the penthouse.');
    formData.append('To', 'whatsapp:+14155238886');

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log("Response Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
