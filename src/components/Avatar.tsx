interface AvatarProps {
  name: string;
  size?: 'sm' | 'lg';
}

export default function Avatar({ name, size = 'sm' }: AvatarProps) {
  const dim = size === 'lg' ? 80 : 40;
  const fontSize = size === 'lg' ? 32 : 18;
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: dim,
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        fontSize,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
