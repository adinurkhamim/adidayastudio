interface MetaTextProps {
  date?: string;
  extra?: string;
}

export function MetaText({ date, extra }: MetaTextProps) {
  return (
    <p className="text-body-sm text-adidaya-text-muted">
      {date}
      {date && extra && " • "}
      {extra}
    </p>
  );
}
