/** Generate a UUID v4 without requiring crypto (works in insecure contexts too). */
export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for insecure contexts (e.g. http:// IP addresses)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
