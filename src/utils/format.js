const money = (n) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export function formatPay(job) {
  const unit = job.payUnit === 'year' ? '/yr' : '/hr';
  return `${money(job.payMin)}–${money(job.payMax)}${unit}`;
}

export function postedLabel(days) {
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function locationLabel(job) {
  return job.remote ? 'Remote · US' : `${job.city}, ${job.state}`;
}

export function firstName(name = '') {
  return name.trim().split(' ')[0] || 'there';
}
