/**
 * Phone Verification Service for TindaGo
 * 
 * This service handles phone number verification using SMS.
 * For production, integrate with SMS providers like:
 * - Twilio
 * - AWS SNS
 * - Firebase Phone Auth (requires dev build)
 * - Vonage (formerly Nexmo)
 */

export interface PhoneVerificationResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  isValid?: boolean;
}

class PhoneVerificationService {
  private static instance: PhoneVerificationService;
  private verificationCodes: Map<string, { code: string; timestamp: number; attempts: number }> = new Map();
  
  static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  /**
   * Send verification code to phone number
   * In production, replace with real SMS API
   */
  async sendVerificationCode(phoneNumber: string): Promise<PhoneVerificationResponse> {
    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanedPhone = this.cleanPhoneNumber(phoneNumber);
      
      if (!this.isValidPhoneNumber(cleanedPhone)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      // Generate 4-digit verification code
      const verificationCode = this.generateVerificationCode();
      
      // Store verification code with timestamp and attempts
      this.verificationCodes.set(cleanedPhone, {
        code: verificationCode,
        timestamp: Date.now(),
        attempts: 0
      });

      // In development/demo mode, log the code
      console.log(`📱 SMS Verification Code for ${phoneNumber}: ${verificationCode}`);
      
      // TODO: Replace with real SMS API integration
      // Example with Twilio:
      // await this.sendTwilioSMS(cleanedPhone, verificationCode);
      
      // For demo purposes, we'll simulate SMS sending
      await this.simulateSMSSending();

      return {
        success: true,
        message: `Verification code sent to ${phoneNumber}`,
        verificationId: cleanedPhone
      };

    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  /**
   * Verify the entered code
   */
  async verifyCode(phoneNumber: string, code: string): Promise<VerifyCodeResponse> {
    try {
      const cleanedPhone = this.cleanPhoneNumber(phoneNumber);
      const storedVerification = this.verificationCodes.get(cleanedPhone);

      if (!storedVerification) {
        return {
          success: false,
          message: 'No verification code found for this phone number'
        };
      }

      // Check if code is expired (5 minutes)
      const isExpired = (Date.now() - storedVerification.timestamp) > 5 * 60 * 1000;
      if (isExpired) {
        this.verificationCodes.delete(cleanedPhone);
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check attempts (max 3 attempts)
      if (storedVerification.attempts >= 3) {
        this.verificationCodes.delete(cleanedPhone);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new verification code.'
        };
      }

      // Increment attempts
      storedVerification.attempts++;

      // Verify code
      if (storedVerification.code === code) {
        // Success - remove from storage
        this.verificationCodes.delete(cleanedPhone);
        return {
          success: true,
          message: 'Phone number verified successfully!',
          isValid: true
        };
      } else {
        return {
          success: false,
          message: `Invalid verification code. ${3 - storedVerification.attempts} attempts remaining.`,
          isValid: false
        };
      }

    } catch (error) {
      console.error('Code verification error:', error);
      return {
        success: false,
        message: 'Failed to verify code. Please try again.'
      };
    }
  }

  /**
   * Clean phone number - remove non-digit characters
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * Validate phone number format
   * Basic validation - can be enhanced based on requirements
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Philippine phone number validation (11 digits starting with 09)
    // Adjust based on your target regions
    const philippinePattern = /^(09|\+639)\d{9}$/;
    const internationalPattern = /^\+?[1-9]\d{7,14}$/;
    
    return philippinePattern.test(phoneNumber) || internationalPattern.test(phoneNumber);
  }

  /**
   * Generate 4-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Simulate SMS sending delay
   */
  private async simulateSMSSending(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 1000); // 1 second delay to simulate network request
    });
  }

  /**
   * Integration example with Twilio (for production)
   * Uncomment and configure when ready to use real SMS
   */
  /*
  private async sendTwilioSMS(phoneNumber: string, code: string): Promise<void> {
    const accountSid = 'your_account_sid';
    const authToken = 'your_auth_token';
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: `Your TindaGo verification code is: ${code}`,
      from: '+1234567890', // Your Twilio phone number
      to: phoneNumber
    });
  }
  */

  /**
   * Get verification status for debugging
   */
  getVerificationStatus(phoneNumber: string) {
    const cleanedPhone = this.cleanPhoneNumber(phoneNumber);
    const verification = this.verificationCodes.get(cleanedPhone);
    
    if (!verification) return null;
    
    return {
      hasCode: true,
      timestamp: verification.timestamp,
      attempts: verification.attempts,
      isExpired: (Date.now() - verification.timestamp) > 5 * 60 * 1000
    };
  }

  /**
   * Clear all verification codes (for testing)
   */
  clearAllCodes(): void {
    this.verificationCodes.clear();
  }
}

export default PhoneVerificationService;