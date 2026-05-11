import Anthropic from '@anthropic-ai/sdk';
import env from '../env.js';

const client = new Anthropic({
  apiKey: env.claudeApiKey,
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentContext {
  agentName: string;
  systemPrompt: string;
  customerContext?: {
    email?: string;
    phone?: string;
    crm_data?: Record<string, any>;
    email_history?: string[];
  };
}

export class ClaudeService {
  async generateResponse(
    messages: ConversationMessage[],
    context: AgentContext,
    stream: boolean = true
  ): Promise<string | AsyncIterable<string>> {
    const systemPrompt = this.buildSystemPrompt(context);

    if (stream) {
      return this.streamResponse(systemPrompt, messages);
    } else {
      return this.getNonStreamResponse(systemPrompt, messages);
    }
  }

  private buildSystemPrompt(context: AgentContext): string {
    let prompt = context.systemPrompt;

    if (context.customerContext) {
      prompt += '\n\n## Customer Context\n';
      if (context.customerContext.email) {
        prompt += `Email: ${context.customerContext.email}\n`;
      }
      if (context.customerContext.crm_data) {
        prompt += `CRM Data: ${JSON.stringify(context.customerContext.crm_data, null, 2)}\n`;
      }
      if (context.customerContext.email_history && context.customerContext.email_history.length > 0) {
        prompt += `Recent Emails:\n${context.customerContext.email_history.join('\n---\n')}\n`;
      }
    }

    prompt += `\n\nYou are ${context.agentName}, an AI phone agent. Keep responses concise and natural for speech (avoid special characters).`;

    return prompt;
  }

  private async* streamResponse(
    systemPrompt: string,
    messages: ConversationMessage[]
  ): AsyncIterable<string> {
    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as any,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  private async getNonStreamResponse(
    systemPrompt: string,
    messages: ConversationMessage[]
  ): Promise<string> {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as any,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '';
  }
}

export default new ClaudeService();
