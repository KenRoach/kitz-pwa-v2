/**
 * POST /api/pwa/chat — Vercel serverless function for PWA chat.
 *
 * Authenticates via x-kitz-user-id header (set by PWA from OTP-verified userId).
 * Streams Anthropic response back as SSE.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Eres Kitz, tu asistente personal de negocios. Ayudas a pequeñas y medianas empresas en Latinoamérica con ventas, contactos, cotizaciones y operaciones diarias.

Reglas:
- Responde en el idioma del usuario (español, inglés o portugués)
- Sé cálido, directo y profesional
- Si no sabes algo, dilo honestamente
- Mantén las respuestas concisas pero útiles
- Usa emojis con moderación para dar calidez`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-kitz-user-id'] as string | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Missing user ID' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { message, history = [] } = req.body as {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error';
    res.write(
      `data: ${JSON.stringify({ error: errorMessage })}\n\n`,
    );
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
