import env from '../env.js';

export interface N8nWebhook {
  crm_lookup?: string;
  email_history?: string;
  booking?: string;
  [key: string]: string | undefined;
}

export class N8nService {
  private baseUrl: string;

  constructor(baseUrl: string = env.n8n.url) {
    this.baseUrl = baseUrl;
  }

  async fetchData(webhookUrl: string, params?: Record<string, any>): Promise<any> {
    try {
      const url = new URL(webhookUrl, this.baseUrl);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('N8n fetch error:', error);
      return null;
    }
  }

  async getCrmData(webhookUrl: string, email: string): Promise<Record<string, any> | null> {
    return this.fetchData(webhookUrl, { email });
  }

  async getEmailHistory(webhookUrl: string, customerId: string, limit: number = 5): Promise<string[] | null> {
    const data = await this.fetchData(webhookUrl, { customer_id: customerId, limit });
    if (data && Array.isArray(data.emails)) {
      return data.emails.map((e: any) => `From: ${e.from}\nSubject: ${e.subject}\nBody: ${e.body}`);
    }
    return null;
  }

  async bookAppointment(webhookUrl: string, customerId: string, dateTime: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl + webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, date_time: dateTime }),
      });
      return response.ok;
    } catch (error) {
      console.error('Booking error:', error);
      return false;
    }
  }
}

export default new N8nService();
