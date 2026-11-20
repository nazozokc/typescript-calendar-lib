/** Turn heading text into a URL-friendly id (Unicode-aware). */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create a slugger that keeps duplicate headings unique.
 *
 * Both the rendered page and the table of contents use this same sequence so
 * their ids always match (duplicate headings become `foo`, `foo-1`, ...).
 */
export function createSlugger(): (text: string) => string {
  const used = new Set<string>();
  const counts = new Map<string, number>();

  const next = (base: string): string => {
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  return (text: string) => {
    const base = slugify(text) || "section";
    let id = next(base);
    while (used.has(id)) {
      // 生成済みの foo-1 と自然な "Foo-1" が衝突した場合は foo 系列の
      // 連番を進める（Foo, Foo, Foo-1 → foo, foo-1, foo-2）
      const parent = /^(.*)-\d+$/.exec(id)?.[1];
      id =
        parent !== undefined && counts.has(parent) ? next(parent) : next(base);
    }
    used.add(id);
    return id;
  };
}
