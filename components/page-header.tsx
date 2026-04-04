export function PageHeader({
  eyebrow,
  title,
  copy,
  actions
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-copy">{copy}</p>
      </div>
      {actions}
    </header>
  );
}
