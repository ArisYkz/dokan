const cyrillicToLatin: Record<string, string> = {
  "а": "a", "ә": "a", "б": "b", "в": "v", "г": "g", "ғ": "g",
  "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i",
  "й": "i", "к": "k", "қ": "k", "л": "l", "м": "m", "н": "n",
  "ң": "n", "о": "o", "ө": "o", "п": "p", "р": "r", "с": "s",
  "т": "t", "у": "u", "ұ": "u", "ү": "u", "ф": "f", "х": "h",
  "һ": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sh", "ъ": "",
  "ы": "y", "і": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya",
};

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .split("")
    .map((c) => cyrillicToLatin[c] || c)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

export const normalizeSlug = (name: string): string => slugify(name) || "store";

/**
 * Slugify a product name for the storefront deep link (/<store>/<product-slug>).
 * Falls back to a short id-based slug when the name has no ASCII (e.g. Bengali).
 */
export const slugifyProductName = (name: string, id: string): string => {
  const base = slugify(name);
  return base || `p-${id.replace(/-/g, "").slice(0, 8)}`;
};
