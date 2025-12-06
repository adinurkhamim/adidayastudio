interface TagPillProps {
  label: string;
}

export function TagPill({ label }: TagPillProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-pill border border-adidaya-border text-label text-adidaya-text-muted">
      {label}
    </span>
  );
}
