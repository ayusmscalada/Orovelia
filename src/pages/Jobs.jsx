import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import JobCard from '../components/JobCard.jsx';
import { jobs, industries, jobTypes } from '../data/jobs.js';

const PAGE_SIZE = 8;
const payOptions = [0, 15, 20, 25, 30];
const hourly = (job) => (job.payUnit === 'year' ? job.payMax / 2080 : job.payMax);

function matches(job, { q, loc, industry, types, remote, minPay }) {
  if (q) {
    const ind = industries.find((i) => i.id === job.industry);
    const hay = `${job.title} ${job.employer} ${job.summary} ${ind.name} ${ind.occupations.join(' ')}`.toLowerCase();
    if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  if (loc) {
    const l = loc.toLowerCase();
    if (l.includes('remote')) {
      if (!job.remote) return false;
    } else if (!`${job.city}, ${job.state}`.toLowerCase().includes(l)) return false;
  }
  if (industry && job.industry !== industry) return false;
  if (types.length && !types.includes(job.type)) return false;
  if (remote && !job.remote) return false;
  if (minPay && hourly(job) < minPay) return false;
  return true;
}

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawer, setDrawer] = useState(false);

  const filters = {
    q: params.get('q') || '',
    loc: params.get('loc') || '',
    industry: params.get('industry') || '',
    types: params.get('type')?.split(',').filter(Boolean) || [],
    remote: params.get('remote') === '1',
    minPay: Number(params.get('pay') || 0),
    sort: params.get('sort') || 'newest',
  };

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === 0 || v === false || v == null || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : v === true ? '1' : v);
    });
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const list = jobs.filter((j) => matches(j, filters));
    return filters.sort === 'pay'
      ? list.sort((a, b) => hourly(b) - hourly(a))
      : list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => setVisible(PAGE_SIZE), [params]);

  const activeCount =
    (filters.industry ? 1 : 0) + filters.types.length + (filters.remote ? 1 : 0) + (filters.minPay ? 1 : 0);

  const toggleType = (t) =>
    update({ type: filters.types.includes(t) ? filters.types.filter((x) => x !== t) : [...filters.types, t] });

  return (
    <>
      <section className="jobs-hero">
        <div className="hero__aurora" aria-hidden="true">
          <span className="blob blob--gold" />
          <span className="blob blob--violet" />
        </div>
        <div className="container">
          <span className="eyebrow page-hero__eyebrow">Find jobs</span>
          <h1 className="jobs-hero__title">
            {filters.q ? <>Jobs for “<em>{filters.q}</em>”</> : <>Every role, <em>hand-picked</em>.</>}
          </h1>
          <SearchBar
            key={`${filters.q}|${filters.loc}`}
            initialQ={filters.q}
            initialLoc={filters.loc}
            size="md"
            onSearch={({ q, loc }) => update({ q, loc })}
          />
        </div>
      </section>

      <section className="section section--tight jobs-page">
        <div className="container jobs-layout">
          <aside className={`filters ${drawer ? 'is-open' : ''}`} aria-label="Filters">
            <div className="filters__head">
              <h2>Filters</h2>
              {activeCount > 0 && (
                <button className="filters__clear" onClick={() => update({ industry: '', type: [], remote: false, pay: 0 })}>
                  Clear all
                </button>
              )}
              <button className="filters__close" onClick={() => setDrawer(false)} aria-label="Close filters">×</button>
            </div>

            <div className="filters__group">
              <h3>Industry</h3>
              <label className="radio">
                <input type="radio" name="industry" checked={!filters.industry} onChange={() => update({ industry: '' })} />
                <span>All industries</span>
              </label>
              {industries.map((ind) => (
                <label key={ind.id} className="radio">
                  <input
                    type="radio"
                    name="industry"
                    checked={filters.industry === ind.id}
                    onChange={() => update({ industry: ind.id })}
                  />
                  <span>{ind.icon} {ind.name}</span>
                  <small>{jobs.filter((j) => j.industry === ind.id).length}</small>
                </label>
              ))}
            </div>

            <div className="filters__group">
              <h3>Job type</h3>
              {jobTypes.map((t) => (
                <label key={t} className="check">
                  <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleType(t)} />
                  <span>{t}</span>
                </label>
              ))}
              <label className="switch">
                <input type="checkbox" checked={filters.remote} onChange={(e) => update({ remote: e.target.checked })} />
                <span className="switch__track" aria-hidden="true" />
                <span>Remote only</span>
              </label>
            </div>

            <div className="filters__group">
              <h3>Minimum pay</h3>
              <div className="chips">
                {payOptions.map((p) => (
                  <button
                    key={p}
                    className={`chip chip--sm ${filters.minPay === p ? 'is-active' : ''}`}
                    onClick={() => update({ pay: p })}
                  >
                    {p ? `$${p}+/hr` : 'Any'}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn--gold filters__apply" onClick={() => setDrawer(false)}>
              Show {results.length} jobs
            </button>
          </aside>

          <div className="results">
            <div className="results__bar">
              <p>
                <strong>{results.length}</strong> {results.length === 1 ? 'job' : 'jobs'}
                {filters.loc && <> in <strong>{filters.loc}</strong></>}
              </p>
              <div className="results__tools">
                <button className="chip filters__toggle" onClick={() => setDrawer(true)}>
                  ⚙ Filters {activeCount > 0 && <span className="chip__count">{activeCount}</span>}
                </button>
                <label className="select">
                  <span>Sort</span>
                  <select value={filters.sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
                    <option value="newest">Newest</option>
                    <option value="pay">Highest pay</option>
                  </select>
                </label>
              </div>
            </div>

            {results.length ? (
              <div className="job-list">
                {results.slice(0, visible).map((job, i) => (
                  <div key={job.id} className="job-list__item" style={{ animationDelay: `${(i % PAGE_SIZE) * 50}ms` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <span className="empty__icon">⌕</span>
                <h3>No jobs match those filters</h3>
                <p>Try a broader keyword, or tell a recruiter what you’re looking for — new roles arrive every day.</p>
                <div className="page-hero__actions">
                  <button className="btn btn--ghost" onClick={() => setParams({}, { replace: true })}>Reset search</button>
                  <Link to="/signup" className="btn btn--gold">Create a profile <span className="btn__shine" /></Link>
                </div>
              </div>
            )}

            {visible < results.length && (
              <div className="results__more">
                <button className="btn btn--ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more jobs ({results.length - visible} left)
                </button>
              </div>
            )}
          </div>
        </div>
        {drawer && <div className="filters__scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}
      </section>
    </>
  );
}
