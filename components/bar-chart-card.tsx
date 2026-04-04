type BarChartRow = {
  label: string;
  value: number;
  max: number;
};

export function BarChartCard({
  title,
  rows
}: {
  title: string;
  rows: BarChartRow[];
}) {
  return (
    <article className="card">
      <h2 className="panel-title">{title}</h2>
      <div className="chart-list">
        {rows.map((row) => {
          const width = `${(row.value / row.max) * 100}%`;
          return (
            <div className="chart-row" key={row.label}>
              <span>{row.label}</span>
              <div className="bar" aria-hidden="true">
                <span style={{ width }} />
              </div>
              <strong>{row.value}</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}
