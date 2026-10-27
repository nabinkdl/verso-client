interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'lg';
}

export default function Avatar({ name, src, size = 'sm' }: AvatarProps) {
  const dim = size === 'lg' ? 80 : 40;
  const fontSize = size === 'lg' ? 32 : 18;
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: dim,
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        color: 'var(--text-soft-2)',
        fontSize,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
