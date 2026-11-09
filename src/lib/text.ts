/**
 * Text helpers for content fields.
 */

/** Before an opening quote: the start, a space, an opening bracket or quote, or a dash. */
const OPENS = /(^|[\s([{“‘—–-])/;

/**
 * Straight quotes as curly ones, as the writing conventions ask:
 * "The Best of Stories" → “The Best of Stories”, Qur'an → Qur’an,
 * 'Ilm → ‘Ilm. A quote that follows a space or an opening bracket opens;
 * any other closes, or is an apostrophe.
 */
export function curlQuotes(text: string): string {
  return text
    .replace(new RegExp(`${OPENS.source}"`, 'g'), '$1“')
    .replaceAll('"', '”')
    .replace(new RegExp(`${OPENS.source}'`, 'g'), '$1‘')
    .replaceAll("'", '’');
}

/**
 * Emoji: flags (two regional indicators), characters shown as emoji by
 * default, and symbols made emoji by the variation selector (✂️).
 */
export const EMOJI = /\p{Regional_Indicator}{2}|\p{Emoji_Presentation}|\p{Extended_Pictographic}️/gu;
