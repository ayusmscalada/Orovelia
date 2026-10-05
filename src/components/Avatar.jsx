export default function Avatar({ name, hue = 40, photo, size = 72 }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <span className="avatar" style={{ '--hue': hue, width: size, height: size }}>
      <span className="avatar__ring" aria-hidden="true" />
      {photo ? (
        <img src={photo} alt={name} className="avatar__img" />
      ) : (
        <span className="avatar__initials" style={{ fontSize: size * 0.34 }}>{initials}</span>
      )}
    </span>
  );
}
