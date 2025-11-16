/**
 * Generate consistent color for a tag based on its name
 */
export function getTagColor(tag: string): string {
  const colors = [
    "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "bg-green-100 text-green-800 hover:bg-green-200",
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "bg-pink-100 text-pink-800 hover:bg-pink-200",
    "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    "bg-red-100 text-red-800 hover:bg-red-200",
    "bg-orange-100 text-orange-800 hover:bg-orange-200",
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
