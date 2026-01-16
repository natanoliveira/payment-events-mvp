export function formatPersonName(name: string): string {
  if (!name) {
    return name;
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      const normalized = word.toLowerCase();
      if (normalized.length === 2) {
        return normalized;
      }
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(' ');
}
