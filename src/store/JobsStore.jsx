import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedJobs } from '../data/jobs.js';
import { fetchOpenJobs, isSupabaseConfigured } from '../lib/supabase.js';

// Public job listings for the whole site.
// With Supabase: loaded from the `jobs` table (cached in localStorage so repeat visits paint instantly).
// Without it: the starter listings in data/jobs.js, so the site still works as a demo.
const CACHE_KEY = 'orovelia:jobs:v1';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const JobsContext = createContext(null);

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState(() => (isSupabaseConfigured ? readCache() || [] : seedJobs));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const next = await fetchOpenJobs();
      setJobs(next);
      setError('');
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const byId = new Map(jobs.map((j) => [j.id, j]));
    return {
      jobs,
      loading,
      error,
      refresh,
      getJob: (id) => byId.get(id),
      jobsInIndustry: (industryId) => jobs.filter((j) => j.industry === industryId),
    };
  }, [jobs, loading, error, refresh]);

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  return useContext(JobsContext);
}
