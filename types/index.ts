export type Language = 'en' | 'yo' | 'sw' | 'ha' | 'am';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  photos: string[];
  languages: Language[];
  community: string;
  religion: string;
  values: string[];
  interests: string[];
  familyValues: 'traditional' | 'modern' | 'balanced';
  lookingFor: 'relationship' | 'friendship' | 'marriage' | 'networking';
  location: { latitude: number; longitude: number };
  isVerified: boolean;
  isPhotoVerified: boolean;
  kycLevel: 'none' | 'phone' | 'id' | 'full';
  safetyScore: number;
  boostedUntil?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  compatibilityScore: number;
  culturalScore: number;
  interestsScore: number;
  status: 'pending' | 'matched' | 'expired' | 'blocked';
  initiatedBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'icebreaker' | 'safety-alert' | 'system';
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'professional' | 'cultural' | 'religious' | 'hobby';
  location: { latitude: number; longitude: number; name: string };
  date: string;
  time: string;
  maxAttendees: number;
  currentAttendees: number;
  hostId: string;
  isPublic: boolean;
  languages: Language[];
  rsvpDeadline: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: 'alumni' | 'professional' | 'hobby' | 'cultural' | 'cause';
  members: string[];
  admins: string[];
  isPublic: boolean;
  languages: Language[];
  rules: string[];
  createdAt: string;
}

export interface FamilyEndorsement {
  id: string;
  userId: string;
  endorserId: string;
  relationship: 'parent' | 'sibling' | 'aunt_uncle' | 'community_elder' | 'friend';
  message: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface SafetyCheckIn {
  id: string;
  userId: string;
  matchId: string;
  location: { latitude: number; longitude: number };
  status: 'active' | 'completed' | 'emergency' | 'expired';
  emergencyContacts: string[];
  checkInInterval: number;
  lastCheckIn: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'harassment' | 'scam' | 'fake_profile' | 'explicit_content' | 'inappropriate_behavior' | 'other';
  description: string;
  evidence: string[];
  status: 'pending' | 'reviewed' | 'resolved' | 'escalated';
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'silver' | 'gold' | 'diamond';
  features: string[];
  expiresAt: string;
  paymentMethod: 'mpesa' | 'airtime' | 'card';
  createdAt: string;
}

export interface USSDSession {
  id: string;
  phone: string;
  currentMenu: string;
  history: string[];
  data: Record<string, string>;
  createdAt: string;
}
