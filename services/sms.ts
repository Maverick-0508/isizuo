import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

    const { error } = await supabase.functions.invoke('quick-worker', {
      body: { phone, message },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SMS] Send error:', error);
    return false;
  }
}

export async function sendOTP(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${EDGE_FUNCTION_BASE}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return true;
  } catch (error) {
    console.error('[OTP] Send error:', error);
    return false;
  }
}

export async function verifyOTP(
  email: string,
  token: string
): Promise<{ session: any; user: any } | null> {
  try {
    const res = await fetch(`${EDGE_FUNCTION_BASE}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, code: token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return { session: data.session, user: data.user };
  } catch (error) {
    console.error('[OTP] Verify error:', error);
    return null;
  }
}

export async function sendMatchNotification(
  phone: string,
  matchName: string
): Promise<boolean> {
  const message = `You have a new match on Isizuo! ${matchName} wants to connect. Open the app to start chatting.`;
  return sendSMS(phone, message);
}

export async function sendSafetyAlert(
  phone: string,
  location: { latitude: number; longitude: number }
): Promise<boolean> {
  const message = `EMERGENCY ALERT from Isizuo user! Location: https://maps.google.com/?q=${location.latitude},${location.longitude}. Please check on them immediately.`;
  return sendSMS(phone, message);
}

export async function sendEventReminder(
  phone: string,
  eventName: string,
  eventDate: string
): Promise<boolean> {
  const message = `Reminder: ${eventName} is happening on ${eventDate}. Don't forget to attend! Open Isizuo for details.`;
  return sendSMS(phone, message);
}

export async function sendFamilyEndorsementRequest(
  phone: string,
  endorserName: string,
  profileName: string
): Promise<boolean> {
  const message = `${profileName} has requested your endorsement on Isizuo. You are important to them! Click the link to write your endorsement.`;
  return sendSMS(phone, message);
}

export async function sendCheckInReminder(
  phone: string,
  intervalMinutes: number
): Promise<boolean> {
  const message = `Safety Check-In reminder: It's been ${intervalMinutes} minutes. Please confirm you're safe on Isizuo.`;
  return sendSMS(phone, message);
}

export async function handleUSSDRequest(
  phone: string,
  sessionId: string,
  input: string
): Promise<string> {
  const menu = `CON Welcome to Isizuo
1. View Matches
2. My Profile
3. Safety Check-In
4. Events Near Me
5. My Credits
0. Exit`;

  const matchMenu = `CON Matches Menu
1. View Next Match
2. Like Current Match
3. Pass Current Match
0. Back`;

  const parts = input.split('*');
  const mainInput = parts[0];

  if (input === '') {
    return menu;
  }

  switch (mainInput) {
    case '1':
      return matchMenu;
    case '2':
      return `CON My Profile\n1. View Profile\n2. Update Bio\n0. Back`;
    case '3':
      return `CON Safety Check-In\n1. Start Check-In\n2. Share Location\n3. Emergency SOS\n0. Back`;
    case '4':
      return `CON Events\n1. Social\n2. Professional\n3. Cultural\n0. Back`;
    case '5':
      return `CON Credits\nBalance: 10 credits\n1. Buy Credits (M-Pesa)\n2. Buy Credits (Airtime)\n0. Back`;
    case '0':
      return 'END Thank you for using Isizuo!';
    default:
      return 'END Invalid option. Please try again.';
  }
}
