// Shared OTP store for phone verification
// In production, replace this with Redis or Firestore with TTL

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// Singleton in-memory store
export const otpStore = new Map<string, OTPData>();

export const MAX_ATTEMPTS = 5;
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Helper to generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
