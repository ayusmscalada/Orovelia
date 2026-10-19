import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Keyword + location search. Navigates to /jobs, or calls onSearch when embedded there.
export default function SearchBar({ initialQ = '', initialLoc = '', onSearch, size = 'lg' }) {
  const [q, setQ] = useState(initialQ);
  const [loc, setLoc] = useState(initialLoc);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (onSearch) return onSearch({ q: q.trim(), loc: loc.trim() });
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (loc.trim()) params.set('loc', loc.trim());
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form className={`searchbar searchbar--${size}`} onSubmit={submit} role="search">
      <label className="searchbar__field">
        <span className="searchbar__icon" aria-hidden="true">⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or keyword" aria-label="Keyword" />
      </label>
      <span className="searchbar__divider" aria-hidden="true" />
      <label className="searchbar__field">
        <span className="searchbar__icon" aria-hidden="true">⌖</span>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City, state or “remote”" aria-label="Location" />
      </label>
      <button type="submit" className="btn btn--gold searchbar__btn">
        Search jobs
        <span className="btn__shine" />
      </button>
    </form>
  );
}
