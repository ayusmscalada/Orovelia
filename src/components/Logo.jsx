export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset=".5" stopColor="#f0b24a" />
          <stop offset="1" stopColor="#b26bff" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#logo-g)" strokeWidth="4" />
      <path d="M32 12c10 8 12 26 0 40-6-10-6-28 0-40z" fill="url(#logo-g)" />
    </svg>
  );
}
