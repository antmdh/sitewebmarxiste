export interface MessagePayload {
  kind: 'contact' | 'newsletter';
  locale: string;
  submittedAt: string;
  fields: Record<string, string>;
}

export interface ContactEnvironment {
  CONTACT_WEBHOOK_URL?: string;
}

export type DeliveryResult =
  { delivered: true } | { delivered: false; reason: 'not-configured' | 'provider-error' };

/**
 * Unique integration boundary for transactional messages.
 * The URL is read only from the Cloudflare server environment and never reaches browser code.
 */
export async function deliverMessage(
  payload: MessagePayload,
  env: ContactEnvironment,
): Promise<DeliveryResult> {
  if (!env.CONTACT_WEBHOOK_URL) return { delivered: false, reason: 'not-configured' };

  try {
    const response = await fetch(env.CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok ? { delivered: true } : { delivered: false, reason: 'provider-error' };
  } catch {
    return { delivered: false, reason: 'provider-error' };
  }
}
