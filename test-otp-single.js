require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testOTP(email) {
  try {
    console.log(`\n📧 Testing OTP for: ${email}`);
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-otp`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OTP Sent!');
      console.log('Response:', data);
      
      if (data.code) {
        console.log(`\n🔐 Code for testing: ${data.code}`);
      }
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test with original email first
testOTP('verbosedoodle@gmail.com');
