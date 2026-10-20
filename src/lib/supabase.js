const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Secret keys bypass row level security and are rejected by Supabase in browsers — refuse to use one.
const isSecretKey = key?.startsWith('sb_secret_');
if (isSecretKey) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY is a secret key. Use the publishable (sb_publishable_…) key instead.');
}

export const isSupabaseConfigured = Boolean(url && key && !isSecretKey);

// The Supabase SDK is ~60 kB gzipped, so it loads in its own chunk after first paint
// instead of delaying the landing page. Resolves to null when not configured.
let clientPromise;
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    // Implicit flow so confirmation / reset links work even when opened in a different browser.
    createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  );
  return clientPromise;
}

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
    role: row.role || 'candidate',
    createdAt: row.created_at,
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

// ---------- Jobs ----------
const DAY = 86400000;

export function jobFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    industry: row.industry,
    employer: row.employer,
    city: row.city,
    state: row.state,
    remote: row.remote,
    type: row.type,
    schedule: row.schedule,
    payMin: Number(row.pay_min),
    payMax: Number(row.pay_max),
    payUnit: row.pay_unit,
    summary: row.summary,
    responsibilities: row.responsibilities || [],
    requirements: row.requirements || [],
    benefits: row.benefits || [],
    urgent: row.urgent,
    recruiterId: row.recruiter_id,
    status: row.status,
    createdAt: row.created_at,
    postedDaysAgo: Math.max(0, Math.floor((Date.now() - new Date(row.created_at).getTime()) / DAY)),
  };
}

export function jobToRow(j) {
  return {
    title: j.title.trim(),
    industry: j.industry,
    employer: j.employer.trim(),
    city: j.remote ? 'Remote' : j.city.trim(),
    state: j.remote ? 'US' : j.state.trim().toUpperCase(),
    remote: Boolean(j.remote),
    type: j.type,
    schedule: j.schedule.trim(),
    pay_min: Number(j.payMin),
    pay_max: Number(j.payMax),
    pay_unit: j.payUnit,
    summary: j.summary.trim(),
    responsibilities: j.responsibilities.map((x) => x.trim()).filter(Boolean),
    requirements: j.requirements.map((x) => x.trim()).filter(Boolean),
    benefits: j.benefits.map((x) => x.trim()).filter(Boolean),
    urgent: Boolean(j.urgent),
    recruiter_id: j.recruiterId,
    status: j.status || 'open',
  };
}

// Public job listings via plain REST — no SDK needed, so the landing page stays light.
export async function fetchOpenJobs() {
  const res = await fetch(`${url}/rest/v1/jobs?select=*&status=eq.open&order=created_at.desc`, {
    headers: { apikey: key },
  });
  if (!res.ok) throw new Error(`Couldn’t load jobs (${res.status})`);
  return (await res.json()).map(jobFromRow);
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
