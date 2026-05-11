import fetch from 'node-fetch';

const BASE_URL = 'https://api.openphone.com/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhoneNumber {
  id: string; // PN...
  name: string;
  phoneNumber: string; // E.164
  type: string;
}

export interface Message {
  id: string;
  object: string;
  from: string;
  to: string[];
  content: string;
  status: string;
  direction: 'inbound' | 'outbound';
  createdAt: string;
  phoneNumberId: string;
  userId?: string;
}

export interface Call {
  id: string;
  object: string;
  direction: 'inbound' | 'outbound';
  status: string;
  from: string;
  to: string;
  duration?: number;
  createdAt: string;
  completedAt?: string;
  phoneNumberId: string;
  userId?: string;
  aiHandled?: boolean;
}

export interface CallRecording {
  url: string;
  duration?: number;
}

export interface TranscriptLine {
  content: string;
  start: number;
  end: number;
  identifier: string;
  userId?: string;
}

export interface CallTranscript {
  callId: string;
  dialogue: TranscriptLine[];
}

export interface CallSummary {
  callId: string;
  summary: string;
  createdAt: string;
}

export interface CallVoicemail {
  url: string;
  transcription?: string;
  duration?: number;
}

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  emails?: { value: string; type?: string }[];
  phoneNumbers?: { value: string; type?: string }[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  phoneNumberId: string;
  participants: string[];
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Webhook {
  id: string;
  url: string;
  resourceIds?: string[];
  type: 'messages' | 'calls' | 'call-summaries' | 'call-transcripts';
}

// ─── OpenPhone API Client ──────────────────────────────────────────────────────

class OpenPhoneService {
  private apiKey: string = '';
  private phoneNumberId: string = ''; // cached PN... ID
  private webhookBaseUrl: string = '';
  private initialized = false;

  init(apiKey: string, webhookBaseUrl: string) {
    this.apiKey = apiKey;
    this.webhookBaseUrl = webhookBaseUrl;
  }

  private headers() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenPhone API ${method} ${path} → ${res.status}: ${text}`);
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  // ─── Startup ──────────────────────────────────────────────────────────────

  async startup(fromNumber: string): Promise<void> {
    if (!this.apiKey) {
      console.log('⚠️  OpenPhone service not initialized (no API key)');
      return;
    }

    try {
      // Fetch and cache our phoneNumberId
      const id = await this.resolvePhoneNumberId(fromNumber);
      if (id) {
        this.phoneNumberId = id;
        console.log(`✅ OpenPhone: resolved phoneNumberId ${id} for ${fromNumber}`);
      }

      // Register webhooks if base URL is configured
      if (this.webhookBaseUrl && this.phoneNumberId) {
        await this.ensureWebhooks(this.phoneNumberId);
      } else {
        console.log('⚠️  OpenPhone: WEBHOOK_BASE_URL not set — skipping webhook registration');
      }

      this.initialized = true;
    } catch (err) {
      console.error('❌ OpenPhone startup failed:', err);
    }
  }

  private async resolvePhoneNumberId(e164: string): Promise<string | null> {
    try {
      const data = await this.listPhoneNumbers();
      const match = data.find(p => p.phoneNumber === e164 || p.phoneNumber === e164.replace('+', ''));
      return match?.id ?? null;
    } catch (err) {
      console.error('❌ Could not fetch phone numbers:', err);
      return null;
    }
  }

  private async ensureWebhooks(phoneNumberId: string): Promise<void> {
    const webhookUrl = `${this.webhookBaseUrl}/api/dispatch/webhook/openphone`;

    try {
      const existing = await this.listWebhooks();
      const registeredUrls = existing.map(w => w.url);

      const types: Array<'messages' | 'calls' | 'call-summaries' | 'call-transcripts'> = [
        'messages',
        'calls',
        'call-summaries',
        'call-transcripts',
      ];

      for (const type of types) {
        const alreadyExists = registeredUrls.includes(webhookUrl);
        if (!alreadyExists) {
          await this.registerWebhook(type, webhookUrl, [phoneNumberId]);
          console.log(`✅ OpenPhone: registered ${type} webhook → ${webhookUrl}`);
        } else {
          console.log(`ℹ️  OpenPhone: ${type} webhook already registered`);
        }
      }
    } catch (err) {
      console.error('❌ Webhook registration failed:', err);
    }
  }

  // ─── Phone Numbers ─────────────────────────────────────────────────────────

  async listPhoneNumbers(): Promise<PhoneNumber[]> {
    const data = await this.request<{ data: PhoneNumber[] }>('GET', '/phone-numbers');
    return data.data ?? [];
  }

  async getPhoneNumber(id: string): Promise<PhoneNumber> {
    const data = await this.request<{ data: PhoneNumber }>('GET', `/phone-numbers/${id}`);
    return data.data;
  }

  getCachedPhoneNumberId(): string {
    return this.phoneNumberId;
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  async sendMessage(to: string | string[], content: string, from?: string): Promise<Message> {
    const recipients = Array.isArray(to) ? to : [to];
    const data = await this.request<{ data: Message }>('POST', '/messages', {
      content,
      from: from ?? this.apiKey, // fallback — should be overridden with E.164 number
      to: recipients,
    });
    return data.data;
  }

  async listMessages(params: {
    phoneNumberId?: string;
    participants?: string[];
    limit?: number;
    after?: string;
  } = {}): Promise<Message[]> {
    const phoneNumberId = params.phoneNumberId ?? this.phoneNumberId;
    const qs = new URLSearchParams();
    if (phoneNumberId) qs.set('phoneNumberId', phoneNumberId);
    if (params.participants?.length) qs.set('participants', JSON.stringify(params.participants));
    if (params.limit) qs.set('maxResults', String(params.limit));
    if (params.after) qs.set('pageToken', params.after);
    const data = await this.request<{ data: Message[] }>('GET', `/messages?${qs}`);
    return data.data ?? [];
  }

  async getMessage(id: string): Promise<Message> {
    const data = await this.request<{ data: Message }>('GET', `/messages/${id}`);
    return data.data;
  }

  // ─── Calls ────────────────────────────────────────────────────────────────

  async listCalls(params: {
    phoneNumberId?: string;
    participants?: string[];
    limit?: number;
    after?: string;
  } = {}): Promise<Call[]> {
    const phoneNumberId = params.phoneNumberId ?? this.phoneNumberId;
    const qs = new URLSearchParams();
    if (phoneNumberId) qs.set('phoneNumberId', phoneNumberId);
    if (params.participants?.length) qs.set('participants', JSON.stringify(params.participants));
    if (params.limit) qs.set('maxResults', String(params.limit));
    if (params.after) qs.set('pageToken', params.after);
    const data = await this.request<{ data: Call[] }>('GET', `/calls?${qs}`);
    return data.data ?? [];
  }

  async getCall(id: string): Promise<Call> {
    const data = await this.request<{ data: Call }>('GET', `/calls/${id}`);
    return data.data;
  }

  async getCallRecordings(callId: string): Promise<CallRecording[]> {
    const data = await this.request<{ data: CallRecording[] }>('GET', `/calls/${callId}/recordings`);
    return data.data ?? [];
  }

  async getCallTranscript(callId: string): Promise<CallTranscript | null> {
    try {
      const data = await this.request<{ data: CallTranscript }>('GET', `/calls/${callId}/transcript`);
      return data.data ?? null;
    } catch {
      return null;
    }
  }

  async getCallSummary(callId: string): Promise<CallSummary | null> {
    try {
      const data = await this.request<{ data: CallSummary }>('GET', `/calls/${callId}/summary`);
      return data.data ?? null;
    } catch {
      return null;
    }
  }

  async getCallVoicemail(callId: string): Promise<CallVoicemail | null> {
    try {
      const data = await this.request<{ data: CallVoicemail }>('GET', `/calls/${callId}/voicemail`);
      return data.data ?? null;
    } catch {
      return null;
    }
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  async listContacts(params: { limit?: number; after?: string } = {}): Promise<Contact[]> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('maxResults', String(params.limit));
    if (params.after) qs.set('pageToken', params.after);
    const data = await this.request<{ data: Contact[] }>('GET', `/contacts?${qs}`);
    return data.data ?? [];
  }

  async getContact(id: string): Promise<Contact> {
    const data = await this.request<{ data: Contact }>('GET', `/contacts/${id}`);
    return data.data;
  }

  async createContact(contact: {
    firstName?: string;
    lastName?: string;
    company?: string;
    emails?: { value: string; type?: string }[];
    phoneNumbers?: { value: string; type?: string }[];
    customFields?: Record<string, any>;
  }): Promise<Contact> {
    const data = await this.request<{ data: Contact }>('POST', '/contacts', contact);
    return data.data;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const data = await this.request<{ data: Contact }>('PATCH', `/contacts/${id}`, updates);
    return data.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.request<void>('DELETE', `/contacts/${id}`);
  }

  async findContactByPhone(phone: string): Promise<Contact | null> {
    const all = await this.listContacts({ limit: 200 });
    return all.find(c => c.phoneNumbers?.some(p => p.value === phone || p.value === phone.replace('+', ''))) ?? null;
  }

  // ─── Conversations ────────────────────────────────────────────────────────

  async listConversations(params: {
    phoneNumberId?: string;
    userId?: string;
    limit?: number;
    after?: string;
  } = {}): Promise<Conversation[]> {
    const phoneNumberId = params.phoneNumberId ?? this.phoneNumberId;
    const qs = new URLSearchParams();
    if (phoneNumberId) qs.set('phoneNumberId', phoneNumberId);
    if (params.userId) qs.set('userId', params.userId);
    if (params.limit) qs.set('maxResults', String(params.limit));
    if (params.after) qs.set('pageToken', params.after);
    const data = await this.request<{ data: Conversation[] }>('GET', `/conversations?${qs}`);
    return data.data ?? [];
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  async listUsers(): Promise<User[]> {
    const data = await this.request<{ data: User[] }>('GET', '/users');
    return data.data ?? [];
  }

  async getUser(id: string): Promise<User> {
    const data = await this.request<{ data: User }>('GET', `/users/${id}`);
    return data.data;
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async listWebhooks(): Promise<Webhook[]> {
    const data = await this.request<{ data: Webhook[] }>('GET', '/webhooks');
    return data.data ?? [];
  }

  async registerWebhook(
    type: 'messages' | 'calls' | 'call-summaries' | 'call-transcripts',
    url: string,
    resourceIds?: string[],
  ): Promise<Webhook> {
    const data = await this.request<{ data: Webhook }>('POST', `/webhooks/${type}`, {
      url,
      resourceIds,
    });
    return data.data;
  }

  async deleteWebhook(type: string, id: string): Promise<void> {
    await this.request<void>('DELETE', `/webhooks/${type}/${id}`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async getMessageHistory(customerPhone: string, limit = 20): Promise<Message[]> {
    return this.listMessages({
      participants: [customerPhone],
      limit,
    });
  }

  async getCallHistory(customerPhone: string, limit = 10): Promise<Call[]> {
    return this.listCalls({
      participants: [customerPhone],
      limit,
    });
  }
}

export default new OpenPhoneService();
