import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getJob } from '../data/jobs.js';
import { getMember } from '../data/team.js';
import { firstName } from '../utils/format.js';
import { supabase, isSupabaseConfigured, profileFromRow, profileToRow } from '../lib/supabase.js';

// Accounts and profiles live in Supabase (see supabase/migrations).
// Saved jobs, applications and messages are still kept in localStorage, per user, until those tables exist.
const activityKey = (userId) => `orovelia:activity:v2:${userId}`;
const SUPPORT_ID = 'sofia-marquez';

export const STAGES = [
  { id: 'interested', label: 'Interested' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
];

// Demo pacing: how long (ms) an application waits before the simulated recruiter moves it on.
const AUTO_ADVANCE = { interested: 25000, shortlisted: 45000 };

const emptyActivity = {
  saved: [],
  applications: [],
  threads: {},
  readAt: {},
  notifications: [],
  pending: [], // recruiter replies waiting to be delivered: { from, text, dueAt }
  alerts: false,
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const redirect = (path) => `${window.location.origin}${path}`;

function readActivity(userId) {
  try {
    const raw = localStorage.getItem(activityKey(userId));
    return raw ? { ...emptyActivity, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function notify(state, text, to) {
  return [{ id: uid(), text, to, at: now(), read: false }, ...state.notifications].slice(0, 30);
}

function addMessage(state, memberId, from, text) {
  const thread = state.threads[memberId] || [];
  return { ...state.threads, [memberId]: [...thread, { id: uid(), from, text, at: now() }] };
}

function welcome(name) {
  return {
    ...emptyActivity,
    threads: addMessage(
      emptyActivity,
      SUPPORT_ID,
      'them',
      `Hi ${firstName(name)}, welcome to Orovelia! I’m Sofía from candidate support. Your profile is live for our recruiters — browse jobs and tap “I’m interested” on anything you like. I’m here if you need a hand.`
    ),
    notifications: notify(emptyActivity, 'Welcome to Orovelia — your profile is live.', '/dashboard'),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.state;
    case 'TOGGLE_SAVE':
      return {
        ...state,
        saved: state.saved.includes(action.jobId)
          ? state.saved.filter((id) => id !== action.jobId)
          : [action.jobId, ...state.saved],
      };
    case 'EXPRESS_INTEREST': {
      const job = getJob(action.jobId);
      if (!job || state.applications.some((a) => a.jobId === job.id)) return state;
      const app = { jobId: job.id, stage: 'interested', history: [{ stage: 'interested', at: now() }] };
      return {
        ...state,
        applications: [app, ...state.applications],
        threads: addMessage(state, job.recruiterId, 'me', `Hi! I’m interested in the ${job.title} role at ${job.employer}.`),
        notifications: notify(state, `You said yes to ${job.title} at ${job.employer}.`, '/dashboard?tab=applications'),
      };
    }
    case 'WITHDRAW':
      return { ...state, applications: state.applications.filter((a) => a.jobId !== action.jobId) };
    case 'ADVANCE': {
      const job = getJob(action.jobId);
      const label = STAGES.find((s) => s.id === action.stage)?.label;
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.jobId === action.jobId
            ? { ...a, stage: action.stage, history: [...a.history, { stage: action.stage, at: now() }] }
            : a
        ),
        threads: action.message ? addMessage(state, job.recruiterId, 'them', action.message) : state.threads,
        notifications: notify(state, `${job.title} at ${job.employer} moved to ${label}.`, '/dashboard?tab=applications'),
      };
    }
    case 'SEND_MESSAGE':
      return {
        ...state,
        threads: addMessage(state, action.to, 'me', action.text),
        readAt: { ...state.readAt, [action.to]: now() },
      };
    case 'QUEUE_REPLY':
      return { ...state, pending: [...state.pending, { from: action.from, text: action.text, dueAt: Date.now() + action.delay }] };
    case 'DELIVER_DUE': {
      const due = state.pending.filter((p) => p.dueAt <= action.now);
      if (!due.length) return state;
      return due.reduce(
        (s, p) => ({
          ...s,
          threads: addMessage(s, p.from, 'them', p.text),
          notifications: notify(s, `New message from ${getMember(p.from)?.name}.`, `/dashboard?tab=messages&with=${p.from}`),
        }),
        { ...state, pending: state.pending.filter((p) => p.dueAt > action.now) }
      );
    }
    case 'READ_THREAD':
      return { ...state, readAt: { ...state.readAt, [action.id]: now() } };
    case 'READ_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'SET_ALERTS':
      return { ...state, alerts: action.value };
    default:
      return state;
  }
}

// Canned recruiter replies so the inbox feels alive in the demo.
function replyFor(text, memberId, user) {
  const t = text.toLowerCase();
  const name = firstName(user?.name);
  if (/pay|salary|rate|\$/.test(t)) return `Good question, ${name}. The range on the listing is confirmed with the employer, and I can share where you’d likely land once we’ve chatted about your experience.`;
  if (/schedule|shift|hours|weekend|night/.test(t)) return `The schedule on the listing is the starting point — most of our partners have some flexibility. Tell me what works for you and I’ll check.`;
  if (/interview|when|time/.test(t)) return `I’ll confirm a time with the employer and message you here. Interviews usually happen within 2–3 days.`;
  if (memberId === SUPPORT_ID) return `Thanks ${name}! I’ll look into that for you and reply shortly. You can also reach us by phone Mon–Fri, 8am–6pm CT.`;
  return `Thanks ${name}! I’ve noted that and will follow up shortly.`;
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
  // ---------- Auth (Supabase) ----------
  const [session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured');
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const userId = session?.user?.id;

  useEffect(() => {
    if (!supabase) return;
    // Keep this callback synchronous — awaiting Supabase calls inside it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setAuthStatus(next ? 'signedIn' : 'signedOut');
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Load (or repair) the profile whenever a different user signs in.
  useEffect(() => {
    if (!supabase || !userId) return;
    let cancelled = false;
    setProfileError('');
    (async () => {
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

  // ---------- Activity (per user, localStorage) ----------
  const [state, dispatch] = useReducer(reducer, emptyActivity);
  const stateRef = useRef(state);
  stateRef.current = state;
  const loadedFor = useRef(null);
  const lastNotif = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      dispatch({ type: 'LOAD', state: emptyActivity });
      return;
    }
    if (loadedFor.current === user.id) return;
    const stored = readActivity(user.id) || welcome(user.name);
    lastNotif.current = stored.notifications[0]?.id; // don't pop desktop alerts for old items
    loadedFor.current = user.id;
    dispatch({ type: 'LOAD', state: stored });
  }, [user]);

  useEffect(() => {
    if (!loadedFor.current) return;
    try {
      localStorage.setItem(activityKey(loadedFor.current), JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  // Desktop alert whenever a new notification arrives.
  useEffect(() => {
    const latest = state.notifications[0];
    if (latest && latest.id !== lastNotif.current) desktopAlert(state.alerts, latest.text);
    lastNotif.current = latest?.id;
  }, [state.notifications, state.alerts]);

  // Simulated recruiter activity: moves fresh applications forward over time.
  const signedIn = Boolean(user);
  useEffect(() => {
    if (!signedIn) return;
    const id = setInterval(() => {
      const s = stateRef.current;
      for (const app of s.applications) {
        const wait = AUTO_ADVANCE[app.stage];
        const since = Date.now() - new Date(app.history[app.history.length - 1].at).getTime();
        if (!wait || since < wait) continue;
        const job = getJob(app.jobId);
        const recruiter = getMember(job.recruiterId);
        if (app.stage === 'interested') {
          dispatch({
            type: 'ADVANCE',
            jobId: app.jobId,
            stage: 'shortlisted',
            message: `Great news, ${firstName(userRef.current?.name)} — I’ve shortlisted you for ${job.title} and shared your profile with ${job.employer}. I’ll be in touch about an interview. — ${firstName(recruiter?.name)}`,
          });
        } else if (app.stage === 'shortlisted') {
          dispatch({
            type: 'ADVANCE',
            jobId: app.jobId,
            stage: 'interview',
            message: `${job.employer} would love to meet you! Does Thursday at 10am work for a 20-minute interview? Reply here and I’ll confirm.`,
          });
        }
        break; // one change per tick keeps notifications readable
      }
    }, 4000);
    return () => clearInterval(id);
  }, [signedIn]);

  // Deliver queued replies once they're due — survives page reloads because the queue is persisted.
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      if (stateRef.current.pending.some((p) => p.dueAt <= t)) dispatch({ type: 'DELIVER_DUE', now: t });
    }, 800);
    return () => clearInterval(id);
  }, []);

  const sendMessage = useCallback((to, text) => {
    dispatch({ type: 'SEND_MESSAGE', to, text });
    dispatch({ type: 'QUEUE_REPLY', from: to, text: replyFor(text, to, userRef.current), delay: 1600 });
  }, []);

  // ---------- Auth actions ----------
  const auth = useMemo(() => {
    const need = () => {
      if (!supabase) throw new Error('Sign-in isn’t configured yet. Add your Supabase publishable key to .env.local.');
    };
    return {
      // Returns { needsConfirmation } — true when Supabase emailed a confirmation link instead of signing in.
      async signUp(form, password) {
        need();
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
        need();
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      },
      async resendConfirmation(email) {
        need();
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: { emailRedirectTo: redirect('/dashboard') },
        });
        if (error) throw error;
      },
      async sendPasswordReset(email) {
        need();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirect('/reset-password') });
        if (error) throw error;
      },
      async updatePassword(password) {
        need();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
      },
    };
  }, []);

  const updateProfile = useCallback(
    async (next) => {
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
    if (!supabase || !userId) return;
    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw error;
    try {
      localStorage.removeItem(activityKey(userId));
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut({ scope: 'local' });
  }, [userId]);

  const value = useMemo(() => {
    const unreadNotifications = state.notifications.filter((n) => !n.read).length;
    const unreadMessages = Object.entries(state.threads).reduce((sum, [id, msgs]) => {
      const read = state.readAt[id] ? new Date(state.readAt[id]).getTime() : 0;
      return sum + msgs.filter((m) => m.from === 'them' && new Date(m.at).getTime() > read).length;
    }, 0);

    return {
      state,
      user,
      authStatus,
      authLoading,
      authConfigured: isSupabaseConfigured,
      profileError,
      unreadNotifications,
      unreadMessages,
      ...auth,
      logout: auth.signOut,
      updateProfile,
      deleteAccount,
      isSaved: (jobId) => state.saved.includes(jobId),
      applicationFor: (jobId) => state.applications.find((a) => a.jobId === jobId),
      toggleSave: (jobId) => dispatch({ type: 'TOGGLE_SAVE', jobId }),
      expressInterest: (jobId) => {
        if (state.applications.some((a) => a.jobId === jobId)) return;
        dispatch({ type: 'EXPRESS_INTEREST', jobId });
        const job = getJob(jobId);
        dispatch({
          type: 'QUEUE_REPLY',
          from: job.recruiterId,
          text: `Thanks for your interest in ${job.title}! I’m reviewing your profile now and will update you here within a day.`,
          delay: 2000,
        });
      },
      withdraw: (jobId) => dispatch({ type: 'WITHDRAW', jobId }),
      sendMessage,
      readThread: (id) => dispatch({ type: 'READ_THREAD', id }),
      readNotifications: () => dispatch({ type: 'READ_NOTIFICATIONS' }),
      setAlerts: async (on) => {
        if (on && 'Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch {
            /* ignore */
          }
        }
        dispatch({ type: 'SET_ALERTS', value: on });
      },
    };
  }, [state, user, authStatus, authLoading, profileError, auth, updateProfile, deleteAccount, sendMessage]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
