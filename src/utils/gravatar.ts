/**
 * Generates the SHA256 hash for Gravatar avatar & profile operations.
 * CRITICAL: Both trimming and lowercasing the email are required before hashing.
 */
export async function getGravatarHash(email: string): Promise<string> {
  // Trim and lowercase the email - BOTH steps are required
  const cleanedEmail = email.trim().toLowerCase();

  // Create SHA256 hash using the Web Crypto API
  const msgBuffer = new TextEncoder().encode(cleanedEmail);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hash;
}

/**
 * Returns a Gravatar avatar image URL for a given email address.
 */
export async function getGravatarAvatarUrl(email: string, size: number = 80, defaultImage: string = 'identicon'): Promise<string> {
  const hash = await getGravatarHash(email);
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=${encodeURIComponent(defaultImage)}`;
}
