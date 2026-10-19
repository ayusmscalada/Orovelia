import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Secret keys bypass row level security and are rejected by Supabase in browsers — refuse to use one.
const isSecretKey = key?.startsWith('sb_secret_');
if (isSecretKey) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY is a secret key. Use the publishable (sb_publishable_…) key instead.');
}

export const isSupabaseConfigured = Boolean(url && key && !isSecretKey);

// Implicit flow so confirmation / reset links work even when opened in a different browser.
export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// Map between the profiles table (snake_case) and the shape the UI uses.
export function profileFromRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    phone: row.phone,
    city: row.city,
    state: row.state,
    headline: row.headline,
    industries: row.industries || [],
    experience: row.experience || [],
    skills: row.skills || [],
    certificates: row.certificates || [],
    availability: row.availability || { days: [], shifts: [] },
    resumeName: row.resume_name,
  };
}

export function profileToRow(p) {
  return {
    full_name: p.name?.trim() ?? '',
    phone: p.phone ?? '',
    city: p.city ?? '',
    state: (p.state ?? '').toUpperCase(),
    headline: p.headline ?? '',
    industries: p.industries ?? [],
    experience: (p.experience ?? []).filter((e) => e.title || e.company),
    skills: p.skills ?? [],
    certificates: p.certificates ?? [],
    availability: p.availability ?? { days: [], shifts: [] },
    resume_name: p.resumeName ?? '',
  };
}

// Turn Supabase auth errors into friendly copy.
export function authMessage(error) {
  const msg = error?.message || String(error);
  if (/invalid login credentials/i.test(msg)) return 'That email and password don’t match. Try again or reset your password.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first — check your inbox for the link we sent.';
  if (/already registered|already exists/i.test(msg)) return 'An account with this email already exists. Try logging in instead.';
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.';
  if (/password should be at least/i.test(msg)) return 'Your password needs to be at least 8 characters.';
  if (/failed to fetch|network/i.test(msg)) return 'We couldn’t reach the server. Check your connection and try again.';
  return msg;
}
