import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase, isSupabaseConfigured, profileFromRow, profileToRow } from '../lib/supabase.js';
import { useJobs } from './JobsStore.jsx';

// Everything account-related lives in Supabase (see supabase/migrations):
// auth + profiles, saved jobs, applications and the candidate ↔ team conversation.
// Only UI preferences (notification list, desktop alerts) are kept in localStorage.
const prefsKey = (userId) => `orovelia:prefs:v3:${userId}`;

export const STAGES = [
  { id: 'interested', label: 'Interested' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
];
export const stageLabel = (id) => (id === 'rejected' ? 'Not selected' : STAGES.find((s) => s.id === id)?.label || id);

const uid = () => Math.random().toString(36).slice(2, 10);
const redirect = (path) => `${window.location.origin}${path}`;

export const appFromRow = (r) => ({ id: r.id, jobId: r.job_id, candidateId: r.candidate_id, stage: r.stage, history: r.history || [], createdAt: r.created_at, updatedAt: r.updated_at });
export const msgFromRow = (r) => ({ id: r.id, candidateId: r.candidate_id, senderId: r.sender_id, jobId: r.job_id, body: r.body, readAt: r.read_at, createdAt: r.created_at });

const emptyPrefs = { notifications: [], alerts: false };

function readPrefs(userId) {
  try {
    return { ...emptyPrefs, ...JSON.parse(localStorage.getItem(prefsKey(userId)) || '{}') };
  } catch {
    return emptyPrefs;
  }
}

function desktopAlert(enabled, text) {
  try {
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Orovelia', { body: text, icon: '/favicon.svg' });
    }
  } catch {
    /* notifications unsupported */
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { getJob } = useJobs();
  const getJobRef = useRef(getJob);
  getJobRef.current = getJob;

  // ---------- Auth ----------
  const [session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured');
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const userId = session?.user?.id;

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    getSupabase().then((supabase) => {
      if (!supabase || cancelled) return;
      // Keep this callback synchronous — awaiting Supabase calls inside it can deadlock the client.
      const { data } = supabase.auth.onAuthStateChange((event, next) => {
        setSession(next);
        setAuthStatus(next ? 'signedIn' : 'signedOut');
        if (event === 'SIGNED_OUT') setProfile(null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Load (or repair) the profile whenever a different user signs in.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setProfileError('');
    (async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (cancelled) return;
      if (error) {
        setProfileError(error.message);
        return;
      }
      if (data) {
        setProfile(profileFromRow(data));
        return;
      }
      // No row yet (e.g. the account predates the migration): create it from sign-up metadata.
      const meta = session.user.user_metadata || {};
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, email: session.user.email, ...profileToRow(profileFromRow({ ...meta, email: session.user.email })) })
        .select()
        .single();
      if (cancelled) return;
      if (insertError) setProfileError(insertError.message);
      else setProfile(profileFromRow(created));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const user = authStatus === 'signedIn' && profile && profile.id === userId ? profile : null;
  const authLoading = authStatus === 'loading' || (authStatus === 'signedIn' && !user && !profileError);
  const isAdmin = user?.role === 'admin';
  const candidateId = user && !isAdmin ? user.id : null;

  // ---------- Candidate activity ----------
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [prefs, setPrefs] = useState(emptyPrefs);
  const [activityError, setActivityError] = useState('');
  const lastNotif = useRef(null);

  const notify = useCallback((text, to) => {
    setPrefs((p) => ({ ...p, notifications: [{ id: uid(), text, to, at: new Date().toISOString(), read: false }, ...p.notifications].slice(0, 30) }));
  }, []);

  useEffect(() => {
    if (!candidateId) {
      setSaved([]);
      setApplications([]);
      setMessages([]);
      setPrefs(emptyPrefs);
      return;
    }
    const stored = readPrefs(candidateId);
    lastNotif.current = stored.notifications[0]?.id; // don't pop desktop alerts for old items
    setPrefs(stored);

    let channel;
    let cancelled = false;
    (async () => {
      const supabase = await getSupabase();
      const [s, a, m] = await Promise.all([
        supabase.from('saved_jobs').select('job_id').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('*').eq('candidate_id', candidateId).order('created_at'),
      ]);
      if (cancelled) return;
      const err = s.error || a.error || m.error;
      setActivityError(err ? err.message : '');
      if (!s.error) setSaved(s.data.map((r) => r.job_id));
      if (!a.error) setApplications(a.data.map(appFromRow));
      if (!m.error) setMessages(m.data.map(msgFromRow));

      // Live updates: the team moving an application, or replying.
      channel = supabase
        .channel(`candidate:${candidateId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `candidate_id=eq.${candidateId}` }, ({ eventType, new: row, old }) => {
          if (eventType === 'DELETE') {
            setApplications((list) => list.filter((x) => x.id !== old.id));
            return;
          }
          const next = appFromRow(row);
          setApplications((list) => {
            const prev = list.find((x) => x.id === next.id);
            if (prev && prev.stage !== next.stage) {
              const job = getJobRef.current(next.jobId);
              notify(`${job ? job.title : 'Your application'} moved to ${stageLabel(next.stage)}.`, '/dashboard?tab=applications');
            }
            return prev ? list.map((x) => (x.id === next.id ? next : x)) : [next, ...list];
          });
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `candidate_id=eq.${candidateId}` }, ({ new: row }) => {
          const msg = msgFromRow(row);
          setMessages((list) => (list.some((x) => x.id === msg.id) ? list : [...list, msg]));
          if (msg.senderId !== candidateId) notify('New message from the Orovelia team.', '/dashboard?tab=messages');
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) getSupabase().then((supabase) => supabase.removeChannel(channel));
    };
  }, [candidateId, notify]);

  // Persist UI prefs per user.
  useEffect(() => {
    if (!candidateId) return;
    try {
      localStorage.setItem(prefsKey(candidateId), JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs, candidateId]);

  // Desktop alert whenever a new notification arrives.
  useEffect(() => {
    const latest = prefs.notifications[0];
    if (latest && latest.id !== lastNotif.current) desktopAlert(prefs.alerts, latest.text);
    lastNotif.current = latest?.id;
  }, [prefs.notifications, prefs.alerts]);

  // ---------- Auth actions ----------
  const auth = useMemo(() => {
    const need = async () => {
      const supabase = await getSupabase();
      if (!supabase) throw new Error('Sign-in isn’t configured yet. Add your Supabase publishable key to .env.local.');
      return supabase;
    };
    return {
      // Returns { needsConfirmation } — true when Supabase emailed a confirmation link instead of signing in.
      async signUp(form, password) {
        const supabase = await need();
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password,
          // The handle_new_user() trigger turns this metadata into the user's profiles row.
          options: { emailRedirectTo: redirect('/dashboard'), data: profileToRow(form) },
        });
        if (error) throw error;
        // With confirmations on, Supabase hides existing accounts by returning a user with no identities.
        if (data.user && data.user.identities?.length === 0) throw new Error('User already registered');
        return { needsConfirmation: !data.session };
      },
      async signIn(email, password) {
        const supabase = await need();
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      },
      async resendConfirmation(email) {
        const supabase = await need();
        const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: redirect('/dashboard') } });
        if (error) throw error;
      },
      async sendPasswordReset(email) {
        const supabase = await need();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirect('/reset-password') });
        if (error) throw error;
      },
      async updatePassword(password) {
        const supabase = await need();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
      async signOut() {
        const supabase = await getSupabase();
        if (supabase) await supabase.auth.signOut();
      },
    };
  }, []);

  const updateProfile = useCallback(
    async (next) => {
      const supabase = await getSupabase();
      if (!supabase || !userId) return;
      const previous = profile;
      setProfile({ ...profile, ...next }); // optimistic
      const { data, error } = await supabase.from('profiles').update(profileToRow({ ...profile, ...next })).eq('id', userId).select().single();
      if (error) {
        setProfile(previous);
        throw error;
      }
      setProfile(profileFromRow(data));
    },
    [profile, userId]
  );

  const deleteAccount = useCallback(async () => {
    const supabase = await getSupabase();
    if (!supabase || !userId) return;
    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw error;
    try {
      localStorage.removeItem(prefsKey(userId));
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut({ scope: 'local' });
  }, [userId]);

  // ---------- Candidate actions ----------
  const candidate = useMemo(() => {
    const requireCandidate = async () => {
      if (!candidateId) throw new Error('Log in with a job seeker account to do that.');
      return getSupabase();
    };
    return {
      async toggleSave(jobId) {
        const supabase = await requireCandidate();
        const wasSaved = saved.includes(jobId);
        setSaved((list) => (wasSaved ? list.filter((id) => id !== jobId) : [jobId, ...list]));
        const { error } = wasSaved
          ? await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', candidateId)
          : await supabase.from('saved_jobs').insert({ job_id: jobId });
        if (error) {
          setSaved((list) => (wasSaved ? [jobId, ...list] : list.filter((id) => id !== jobId)));
          throw error;
        }
      },
      async expressInterest(jobId) {
        const supabase = await requireCandidate();
        if (applications.some((a) => a.jobId === jobId)) return;
        const { data, error } = await supabase.from('applications').insert({ job_id: jobId }).select().single();
        if (error) throw new Error(/duplicate/i.test(error.message) ? 'You’ve already said yes to this job.' : error.message);
        setApplications((list) => [appFromRow(data), ...list.filter((x) => x.id !== data.id)]);
        const job = getJobRef.current(jobId);
        notify(`You said yes to ${job?.title || 'a job'}${job ? ` at ${job.employer}` : ''}.`, '/dashboard?tab=applications');
        // Let the team know in the conversation, with the job attached.
        const { data: msg } = await supabase
          .from('messages')
          .insert({ candidate_id: candidateId, job_id: jobId, body: `Hi! I’m interested in the ${job?.title || ''} role${job ? ` at ${job.employer}` : ''}.` })
          .select()
          .single();
        if (msg) setMessages((list) => (list.some((x) => x.id === msg.id) ? list : [...list, msgFromRow(msg)]));
      },
      async withdraw(jobId) {
        const supabase = await requireCandidate();
        const { error } = await supabase.from('applications').delete().eq('job_id', jobId).eq('candidate_id', candidateId);
        if (error) throw error;
        setApplications((list) => list.filter((a) => a.jobId !== jobId));
      },
      async sendMessage(body, jobId = null) {
        const supabase = await requireCandidate();
        const { data, error } = await supabase.from('messages').insert({ candidate_id: candidateId, body, job_id: jobId }).select().single();
        if (error) throw error;
        setMessages((list) => (list.some((x) => x.id === data.id) ? list : [...list, msgFromRow(data)]));
      },
      async readThread() {
        if (!candidateId || !messages.some((m) => m.senderId !== candidateId && !m.readAt)) return;
        const now = new Date().toISOString();
        setMessages((list) => list.map((m) => (m.senderId !== candidateId && !m.readAt ? { ...m, readAt: now } : m)));
        const supabase = await getSupabase();
        await supabase.rpc('mark_thread_read', { p_candidate: candidateId });
      },
    };
  }, [candidateId, saved, applications, messages, notify]);

  const value = useMemo(() => {
    const unreadMessages = candidateId ? messages.filter((m) => m.senderId !== candidateId && !m.readAt).length : 0;
    return {
      user,
      isAdmin,
      authStatus,
      authLoading,
      authConfigured: isSupabaseConfigured,
      profileError,
      activityError,
      state: { saved, applications, messages, notifications: prefs.notifications, alerts: prefs.alerts },
      unreadNotifications: prefs.notifications.filter((n) => !n.read).length,
      unreadMessages,
      ...auth,
      logout: auth.signOut,
      updateProfile,
      deleteAccount,
      ...candidate,
      isSaved: (jobId) => saved.includes(jobId),
      applicationFor: (jobId) => applications.find((a) => a.jobId === jobId),
      readNotifications: () => setPrefs((p) => ({ ...p, notifications: p.notifications.map((n) => ({ ...n, read: true })) })),
      setAlerts: async (on) => {
        if (on && 'Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch {
            /* ignore */
          }
        }
        setPrefs((p) => ({ ...p, alerts: on }));
      },
    };
  }, [user, isAdmin, authStatus, authLoading, profileError, activityError, saved, applications, messages, prefs, auth, updateProfile, deleteAccount, candidate, candidateId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
