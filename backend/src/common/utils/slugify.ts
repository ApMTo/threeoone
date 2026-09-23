export function slugify(input: string): string {
  const base = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'item';
}

export function normalizeHexColor(hex: string): string {
  const value = hex.trim().toUpperCase();
  const short = /^#([0-9A-F]{3})$/;
  const full = /^#([0-9A-F]{6})$/;

  if (full.test(value)) {
    return value;
  }

  const shortMatch = value.match(short);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  throw new Error(`Invalid hex color: ${hex}`);
}
