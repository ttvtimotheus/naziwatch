/**
 * Client-side validation for report description: no names, addresses, phone numbers.
 */

const PHONE_REGEX = /[\d\s\-+()]{6,}/;
const EXACT_ADDRESS_REGEX = /(?:straße|str\.|strasse|weg|platz|allee|gasse)\s*\.?\s*\d+/i;
const POSTAL_CODE_REGEX = /\b\d{5}\b/;

/**
 * Heuristic: block if text contains phone-like sequences, exact street addresses, or 5-digit postal codes.
 */
export function validateDescriptionNoPII(text: string): { valid: boolean; message?: string } {
  const t = text.trim();
  if (t.length < 10) {
    return { valid: false, message: 'Bitte mindestens 10 Zeichen eingeben.' };
  }
  if (PHONE_REGEX.test(t)) {
    return { valid: false, message: 'Bitte keine Telefonnummern angeben.' };
  }
  if (EXACT_ADDRESS_REGEX.test(t)) {
    return { valid: false, message: 'Bitte keine genauen Adressen angeben.' };
  }
  if (POSTAL_CODE_REGEX.test(t)) {
    return { valid: false, message: 'Bitte keine Postleitzahlen angeben.' };
  }
  return { valid: true };
}
