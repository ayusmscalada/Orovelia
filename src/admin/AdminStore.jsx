import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase, jobFromRow, jobToRow, profileFromRow } from '../lib/supabase.js';
import { appFromRow, msgFromRow, useApp } from '../store/AppStore.jsx';
import { useJobs } from '../store/JobsStore.jsx';

// Data for the admin area: every job (open and closed), application, candidate and message.
// Row level security only returns all of this to admins (see supabase/migrations/0002).
const AdminContext = createContext(null);

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export function AdminProvider({ children }) {
  const { user } = useApp();
  const { refresh: refreshPublicJobs } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const supabase = await getSupabase();
    const [j, a, c, m] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'candidate').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at').limit(5000),
    ]);
    const err = j.error || a.error || c.error || m.error;
    if (err) setError(err.message);
    else {
      setError('');
      setJobs(j.data.map(jobFromRow));
      setApplications(a.data.map(appFromRow));
      setCandidates(c.data.map(profileFromRow));
      setMessages(m.data.map(msgFromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    let channel;
    let cancelled = false;
    getSupabase().then((supabase) => {
      if (cancelled) return;
      // Live: new applicants, candidate replies, and changes made by other admins.
      channel = supabase
        .channel('admin')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, ({ eventType, new: row, old }) => {
          if (eventType === 'DELETE') setApplications((list) => list.filter((x) => x.id !== old.id));
          else {
            const next = appFromRow(row);
            setApplications((list) => (list.some((x) => x.id === next.id) ? list.map((x) => (x.id === next.id ? next : x)) : [next, ...list]));
            // A brand-new applicant may be someone who signed up after we loaded.
            if (eventType === 'INSERT') {
              supabase.from('profiles').select('*').eq('id', next.candidateId).maybeSingle().then(({ data }) => {
                if (data) setCandidates((list) => (list.some((x) => x.id === data.id) ? list : [profileFromRow(data), ...list]));
              });
            }
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, ({ new: row }) => {
          const msg = msgFromRow(row);
          setMessages((list) => (list.some((x) => x.id === msg.id) ? list : [...list, msg]));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, ({ new: row }) => {
          const msg = msgFromRow(row);
          setMessages((list) => list.map((x) => (x.id === msg.id ? msg : x)));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, ({ eventType, new: row, old }) => {
          if (eventType === 'DELETE') setJobs((list) => list.filter((x) => x.id !== old.id));
          else {
            const next = jobFromRow(row);
            setJobs((list) => (list.some((x) => x.id === next.id) ? list.map((x) => (x.id === next.id ? next : x)) : [next, ...list]));
          }
        })
        .subscribe();
    });
    return () => {
      cancelled = true;
      if (channel) getSupabase().then((supabase) => supabase.removeChannel(channel));
    };
  }, [user, load]);

  const actions = useMemo(() => {
    const db = () => getSupabase();
    const upsertJob = (row) => {
      const job = jobFromRow(row);
      setJobs((list) => (list.some((x) => x.id === job.id) ? list.map((x) => (x.id === job.id ? job : x)) : [job, ...list]));
      refreshPublicJobs();
      return job;
    };
    return {
      reload: load,
      async saveJob(form, id) {
        const supabase = await db();
        const row = jobToRow(form);
        const { data, error } = id
          ? await supabase.from('jobs').update(row).eq('id', id).select().single()
          : await supabase.from('jobs').insert(row).select().single();
        if (error) throw error;
        return upsertJob(data);
      },
      async setJobStatus(id, status) {
        const supabase = await db();
        const { data, error } = await supabase.from('jobs').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        upsertJob(data);
      },
      async deleteJob(id) {
        const supabase = await db();
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (error) throw error;
        setJobs((list) => list.filter((x) => x.id !== id));
        setApplications((list) => list.filter((x) => x.jobId !== id));
        refreshPublicJobs();
      },
      async moveStage(applicationId, stage) {
        const supabase = await db();
        const prev = applications.find((x) => x.id === applicationId);
        setApplications((list) => list.map((x) => (x.id === applicationId ? { ...x, stage } : x))); // optimistic
        const { data, error } = await supabase.from('applications').update({ stage }).eq('id', applicationId).select().single();
        if (error) {
          setApplications((list) => list.map((x) => (x.id === applicationId ? prev : x)));
          throw error;
        }
        const next = appFromRow(data);
        setApplications((list) => list.map((x) => (x.id === next.id ? next : x)));
      },
      async sendMessage(candidateId, body, jobId = null) {
        const supabase = await db();
        const { data, error } = await supabase.from('messages').insert({ candidate_id: candidateId, body, job_id: jobId }).select().single();
        if (error) throw error;
        const msg = msgFromRow(data);
        setMessages((list) => (list.some((x) => x.id === msg.id) ? list : [...list, msg]));
      },
      async markRead(candidateId) {
        const unread = messages.some((m) => m.candidateId === candidateId && m.senderId === candidateId && !m.readAt);
        if (!unread) return;
        const now = new Date().toISOString();
        setMessages((list) => list.map((m) => (m.candidateId === candidateId && m.senderId === candidateId && !m.readAt ? { ...m, readAt: now } : m)));
        const supabase = await db();
        await supabase.rpc('mark_thread_read', { p_candidate: candidateId });
      },
    };
  }, [applications, messages, load, refreshPublicJobs]);

  const value = useMemo(() => {
    const jobById = new Map(jobs.map((j) => [j.id, j]));
    const candidateById = new Map(candidates.map((c) => [c.id, c]));

    // One thread per candidate, newest first.
    const threadMap = new Map();
    for (const m of messages) {
      const t = threadMap.get(m.candidateId) || { candidateId: m.candidateId, messages: [], unread: 0, last: null };
      t.messages.push(m);
      t.last = m;
      if (m.senderId === m.candidateId && !m.readAt) t.unread++;
      threadMap.set(m.candidateId, t);
    }
    const threads = [...threadMap.values()].sort((a, b) => new Date(b.last.createdAt) - new Date(a.last.createdAt));

    return {
      loading,
      error,
      jobs,
      applications: [...applications].sort(byNewest),
      candidates,
      messages,
      threads,
      unreadTotal: threads.reduce((n, t) => n + t.unread, 0),
      getJob: (id) => jobById.get(id),
      getCandidate: (id) => candidateById.get(id),
      applicationsForJob: (jobId) => applications.filter((a) => a.jobId === jobId),
      applicationsForCandidate: (candidateId) => applications.filter((a) => a.candidateId === candidateId),
      threadFor: (candidateId) => threadMap.get(candidateId),
      ...actions,
    };
  }, [loading, error, jobs, applications, candidates, messages, actions]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
