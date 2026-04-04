export function TagChips({ tags }: { tags: string[] }) {
  return (
    <div className="stack">
      <div className="hint">Recommended tags</div>
      <div className="chip-row">
        {tags.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
