require('dotenv').config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'verbosedoodle@gmail.com',
        subject: 'Hello from MCP',
        html: '<p>Hello from MCP!</p>'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Email sent successfully!');
      console.log('Response:', data);
    } else {
      console.error('Error sending email:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendEmail();
