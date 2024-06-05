export function generateDriverNameSlug(firstName: string, lastName: string) {
  const slug = `${firstName}-${lastName}`?.toLowerCase()?.replace(/ /g, "-") || "";
  return slug;
}
