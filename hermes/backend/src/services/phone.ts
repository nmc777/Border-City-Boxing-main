import fetch from 'node-fetch';

export interface PhoneProvider {
  name: string;
  makeCall(to: string, agentId: number, customContext?: Record<string, any>): Promise<string>;
  handleWebhook(event: Record<string, any>): Promise<void>;
}

export interface CallConfig {
  provider: string;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

abstract class BasePhoneProvider implements PhoneProvider {
  name: string = '';

  abstract makeCall(to: string, agentId: number, customContext?: Record<string, any>): Promise<string>;
  abstract handleWebhook(event: Record<string, any>): Promise<void>;
}

export class TwilioProvider extends BasePhoneProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async makeCall(to: string, agentId: number, customContext?: Record<string, any>): Promise<string> {
    // TODO: Implement Twilio API call
    // For now, return a mock call SID
    const callSid = `CA${Math.random().toString(36).substring(2, 15)}`;
    console.log(`📞 Twilio: Making call to ${to} (Agent ${agentId})`);
    return callSid;
  }

  async handleWebhook(event: Record<string, any>): Promise<void> {
    // TODO: Handle Twilio webhook events (CallStatus updates, speech recognition, etc.)
    console.log('📍 Twilio webhook:', event);
  }
}

export class QuoPhoneProvider extends BasePhoneProvider {
  name = 'quo';
  private apiKey: string;
  private fromNumber: string;
  private apiBaseUrl = 'https://api.openphone.com/v1';

  constructor(apiKey: string, fromNumber: string) {
    super();
    this.apiKey = apiKey;
    this.fromNumber = fromNumber;
  }

  async makeCall(to: string, agentId: number, customContext?: Record<string, any>): Promise<string> {
    try {
      // TODO: Implement Quo call API
      // For now, log the attempt
      const callId = `QUO_${Date.now()}`;
      console.log(`📞 Quo: Making call to ${to} (Agent ${agentId})`);
      console.log(`   Call ID: ${callId}`);
      return callId;
    } catch (error) {
      console.error('❌ Quo call error:', error);
      throw error;
    }
  }

  async sendSMS(to: string | string[], message: string, userId?: string): Promise<void> {
    try {
      const phones = Array.isArray(to) ? to : [to];

      // Format phone numbers to E.164
      const formattedPhones = phones.map(p => this.formatE164(p));

      const response = await fetch(`${this.apiBaseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          from: this.fromNumber,
          to: formattedPhones,
          userId: userId,
        }),
      });

      if (response.status === 202) {
        console.log(`✅ SMS sent to ${formattedPhones.join(', ')}`);
      } else {
        throw new Error(`SMS failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Quo SMS error:', error);
      throw error;
    }
  }

  async handleWebhook(event: Record<string, any>): Promise<void> {
    console.log('📍 Quo webhook received:', event);
    // Handle Quo events (incoming calls, message status, etc.)
    // Event structure depends on Quo's webhook format
  }

  private formatE164(phone: string): string {
    // Remove non-digit characters and ensure E.164 format
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`; // Assume US if 10 digits
    }
    if (!digits.startsWith('1') && digits.length === 11) {
      return `+${digits}`;
    }
    if (digits.startsWith('1') && digits.length === 11) {
      return `+${digits}`;
    }
    return `+${digits}`;
  }
}

export class MockPhoneProvider extends BasePhoneProvider {
  name = 'mock';

  async makeCall(to: string, agentId: number, customContext?: Record<string, any>): Promise<string> {
    const callSid = `MOCK_${Date.now()}`;
    console.log(`📞 [MOCK] Making call to ${to} (Agent ${agentId})`);
    return callSid;
  }

  async handleWebhook(event: Record<string, any>): Promise<void> {
    console.log('[MOCK] Webhook:', event);
  }
}

export class PhoneService {
  private providers: Map<string, PhoneProvider> = new Map();

  constructor() {
    // Register available providers
    this.providers.set('mock', new MockPhoneProvider());
    // Twilio will be registered in init()
  }

  init(config: CallConfig) {
    if (config.provider === 'twilio' && config.accountSid && config.authToken && config.fromNumber) {
      this.providers.set('twilio', new TwilioProvider(config.accountSid, config.authToken, config.fromNumber));
    }
    // Quo will be registered separately via initQuo()
  }

  initQuo(apiKey: string, fromNumber: string) {
    this.providers.set('quo', new QuoPhoneProvider(apiKey, fromNumber));
    console.log('✅ Quo phone provider initialized');
  }

  getProvider(name: string): PhoneProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Phone provider '${name}' not found. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider;
  }

  async makeCall(provider: string, to: string, agentId: number, context?: Record<string, any>): Promise<string> {
    return this.getProvider(provider).makeCall(to, agentId, context);
  }

  async handleWebhook(provider: string, event: Record<string, any>): Promise<void> {
    return this.getProvider(provider).handleWebhook(event);
  }

  async sendSMS(provider: string, to: string | string[], message: string, userId?: string): Promise<void> {
    const prov = this.getProvider(provider);
    if ('sendSMS' in prov) {
      return (prov as any).sendSMS(to, message, userId);
    }
    throw new Error(`Provider '${provider}' does not support SMS`);
  }
}

export default new PhoneService();
