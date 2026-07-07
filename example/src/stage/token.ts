/**
 * Client-side parsing of an IVS Real-Time **participant token** (a JWT).
 *
 * We only decode the payload for display (stage, user, expiry) — we never
 * verify the signature; that's AWS's job when the token is used to join. Field
 * names vary a little across token versions, so parsing is defensive: the stage
 * ARN is found by pattern if the expected claim is missing, and `exp`/`iat` are
 * the standard JWT claims.
 */

// Provided by Hermes at runtime; not in our ESNext-only TS lib.
declare const atob: (data: string) => string;

export interface ParsedToken {
  stageArn: string | null;
  /** Last segment of the stage ARN — a short, human-readable id. */
  stageId: string | null;
  userId: string | null;
  username: string | null;
  capabilities: string[];
  /** Epoch ms, or null if absent. */
  issuedAt: number | null;
  expiresAt: number | null;
  /** JWT id (jti) — distinguishes two tokens for the same stage. */
  tokenId: string | null;
}

const ARN_RE = /arn:aws:ivs:[a-z0-9-]+:\d+:stage\/[A-Za-z0-9-]+/;

function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  // Recover UTF-8 (e.g. usernames) from the binary string atob returns.
  try {
    return decodeURIComponent(
      binary
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return binary;
  }
}

/** Find a stage ARN anywhere in the claims (handles differing field names). */
function findStageArn(claims: Record<string, unknown>): string | null {
  const direct = claims.resource;
  if (typeof direct === 'string' && ARN_RE.test(direct)) return direct;
  for (const value of Object.values(claims)) {
    if (typeof value === 'string') {
      const m = value.match(ARN_RE);
      if (m) return m[0];
    }
  }
  return null;
}

/** Normalize the many capability shapes into a lowercase string list. */
function normalizeCapabilities(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((c): c is string => typeof c === 'string')
      .map((c) => c.replace(/^allow_/, '').toLowerCase());
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, v]) => v === true)
      .map(([k]) => k.replace(/^allow_/, '').toLowerCase());
  }
  return [];
}

export function parseParticipantToken(raw: string): ParsedToken | null {
  const parts = raw.trim().split('.');
  if (parts.length < 2 || !parts[1]) return null;
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
  if (typeof claims !== 'object' || claims === null) return null;

  const stageArn = findStageArn(claims);
  const attributes =
    (claims.attributes as Record<string, unknown> | undefined) ?? {};
  const exp = typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  const iat = typeof claims.iat === 'number' ? claims.iat * 1000 : null;

  return {
    stageArn,
    stageId: stageArn ? (stageArn.split('/').pop() ?? null) : null,
    userId: typeof claims.user_id === 'string' ? claims.user_id : null,
    username:
      typeof attributes.username === 'string' ? attributes.username : null,
    capabilities: normalizeCapabilities(claims.capabilities),
    issuedAt: iat,
    expiresAt: exp,
    tokenId: typeof claims.jti === 'string' ? claims.jti : null,
  };
}

export type ExpiryStatus = 'valid' | 'expired' | 'unknown';

export function expiryStatus(
  expiresAt: number | null,
  now: number
): ExpiryStatus {
  if (expiresAt == null) return 'unknown';
  return expiresAt > now ? 'valid' : 'expired';
}

/** Human-readable expiry, e.g. "expires in 11m", "expired 3m ago". */
export function formatExpiry(expiresAt: number | null, now: number): string {
  if (expiresAt == null) return 'no expiry info';
  const diffMs = expiresAt - now;
  const past = diffMs < 0;
  const mins = Math.floor(Math.abs(diffMs) / 60000);
  const hrs = Math.floor(mins / 60);
  const label =
    hrs > 0
      ? `${hrs}h ${mins % 60}m`
      : `${mins}m ${Math.floor((Math.abs(diffMs) % 60000) / 1000)}s`;
  return past ? `expired ${label} ago` : `expires in ${label}`;
}
