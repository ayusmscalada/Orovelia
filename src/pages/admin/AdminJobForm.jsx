import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from './AdminLayout.jsx';
import JobCard from '../../components/JobCard.jsx';
import { useAdmin } from '../../admin/AdminStore.jsx';
import { industries, jobTypes } from '../../data/jobs.js';
import { team } from '../../data/team.js';

const recruiters = team.filter((m) => m.department === 'Recruiting' || m.department === 'Leadership');
const lines = (arr) => (arr || []).join('\n');
const toList = (text) => text.split('\n').map((x) => x.trim()).filter(Boolean);

const blank = {
  title: '',
  employer: '',
  industry: industries[0].id,
  type: jobTypes[0],
  remote: false,
  city: '',
  state: '',
  schedule: '',
  payMin: '',
  payMax: '',
  payUnit: 'hour',
  urgent: false,
  recruiterId: industries[0].recruiter,
  summary: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  status: 'open',
};

function Field({ label, hint, children, wide }) {
  return (
    <label className={`admin-field ${wide ? 'admin-field--wide' : ''}`}>
      <span className="admin-field__label">{label}</span>
      {children}
      {hint && <small className="admin-field__hint">{hint}</small>}
    </label>
  );
}

export default function AdminJobForm() {
  const { id } = useParams();
  const { getJob, saveJob } = useAdmin();
  const existing = id ? getJob(id) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState(() =>
    existing
      ? {
          ...existing,
          payMin: String(existing.payMin),
          payMax: String(existing.payMax),
          responsibilities: lines(existing.responsibilities),
          requirements: lines(existing.requirements),
          benefits: lines(existing.benefits),
        }
      : blank
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (id && !existing) {
    return (
      <div className="empty">
        <span className="empty__icon">?</span>
        <h3>Job not found</h3>
        <p>It may have been deleted.</p>
        <Link to="/admin/jobs" className="btn btn--ghost">Back to jobs</Link>
      </div>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const onIndustry = (e) => {
    const ind = industries.find((i) => i.id === e.target.value);
    // Default the recruiter to that industry's lead unless one was picked by hand.
    setForm((f) => ({ ...f, industry: ind.id, recruiterId: f.recruiterId === industries.find((i) => i.id === f.industry)?.recruiter ? ind.recruiter : f.recruiterId }));
  };

  const payload = {
    ...form,
    responsibilities: toList(form.responsibilities),
    requirements: toList(form.requirements),
    benefits: toList(form.benefits),
  };

  const preview = {
    ...payload,
    id: 'preview',
    title: form.title || 'Job title',
    employer: form.employer || 'Employer',
    city: form.remote ? 'Remote' : form.city || 'City',
    state: form.remote ? 'US' : form.state || 'ST',
    payMin: Number(form.payMin) || 0,
    payMax: Number(form.payMax) || Number(form.payMin) || 0,
    postedDaysAgo: 0,
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Number(form.payMax) < Number(form.payMin)) {
      setError('Maximum pay must be at least the minimum.');
      return;
    }
    setBusy(true);
    try {
      const job = await saveJob(payload, id);
      navigate(`/admin/jobs/${job.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeader
        eyebrow={id ? 'Edit job' : 'New job'}
        title={id ? <>Edit <em>{existing.title}</em></> : <>Post a <em>new</em> job.</>}
        actions={<Link to={id ? `/admin/jobs/${id}` : '/admin/jobs'} className="btn btn--ghost">Cancel</Link>}
      />

      <form className="admin-form-layout" onSubmit={onSubmit}>
        <div className="dash-stack">
          <div className="dash-panel">
            <div className="dash-panel__head"><h3>The role</h3></div>
            <div className="admin-fields">
              <Field label="Job title" wide>
                <input required minLength={2} maxLength={120} value={form.title} onChange={set('title')} placeholder="e.g. Line Cook" />
              </Field>
              <Field label="Employer">
                <input required maxLength={120} value={form.employer} onChange={set('employer')} placeholder="Business name" />
              </Field>
              <Field label="Industry">
                <select value={form.industry} onChange={onIndustry}>
                  {industries.map((i) => <option key={i.id} value={i.id}>{i.icon} {i.name}</option>)}
                </select>
              </Field>
              <Field label="Job type">
                <select value={form.type} onChange={set('type')}>
                  {jobTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Schedule">
                <input value={form.schedule} onChange={set('schedule')} placeholder="e.g. Mon–Fri, 8am–4pm" />
              </Field>
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel__head"><h3>Location & pay</h3></div>
            <div className="admin-fields">
              <label className="switch admin-field--wide">
                <input type="checkbox" checked={form.remote} onChange={set('remote')} />
                <span className="switch__track" aria-hidden="true" />
                <span>Remote role</span>
              </label>
              {!form.remote && (
                <>
                  <Field label="City">
                    <input required value={form.city} onChange={set('city')} />
                  </Field>
                  <Field label="State">
                    <input required maxLength={2} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))} placeholder="TX" />
                  </Field>
                </>
              )}
              <Field label="Pay from ($)">
                <input required type="number" min="0" step="0.5" value={form.payMin} onChange={set('payMin')} />
              </Field>
              <Field label="Pay to ($)">
                <input required type="number" min="0" step="0.5" value={form.payMax} onChange={set('payMax')} />
              </Field>
              <Field label="Per">
                <select value={form.payUnit} onChange={set('payUnit')}>
                  <option value="hour">Hour</option>
                  <option value="year">Year</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel__head"><h3>Description</h3></div>
            <div className="admin-fields">
              <Field label="Summary" wide hint="Two or three sentences shown at the top of the listing.">
                <textarea rows={3} value={form.summary} onChange={set('summary')} />
              </Field>
              <Field label="What they’ll do" wide hint="One per line.">
                <textarea rows={4} value={form.responsibilities} onChange={set('responsibilities')} />
              </Field>
              <Field label="What they’ll need" wide hint="One per line.">
                <textarea rows={4} value={form.requirements} onChange={set('requirements')} />
              </Field>
              <Field label="Perks & benefits" wide hint="One per line.">
                <textarea rows={3} value={form.benefits} onChange={set('benefits')} />
              </Field>
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel__head"><h3>Publishing</h3></div>
            <div className="admin-fields">
              <Field label="Recruiter shown on the listing">
                <select value={form.recruiterId} onChange={set('recruiterId')}>
                  {recruiters.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={set('status')}>
                  <option value="open">Open — visible on the site</option>
                  <option value="closed">Closed — hidden</option>
                </select>
              </Field>
              <label className="switch admin-field--wide">
                <input type="checkbox" checked={form.urgent} onChange={set('urgent')} />
                <span className="switch__track" aria-hidden="true" />
                <span>Show “Hiring fast” badge</span>
              </label>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="btn btn--gold" disabled={busy}>
              {busy ? 'Saving…' : id ? 'Save changes' : 'Publish job'} <span className="btn__shine" />
            </button>
          </div>
        </div>

        <aside className="admin-preview" aria-label="Preview">
          <span className="eyebrow">Live preview</span>
          <div className="admin-preview__card">
            <JobCard job={preview} />
          </div>
          <p className="muted-note">This is how the job appears in search results.</p>
        </aside>
      </form>
    </>
  );
}
