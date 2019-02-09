export type LexerSymbol = RegExp;

export const WHITESPACE = /[^\S\x0a\x0d]/;
export const NEWLINE = /\n/;
export const CHAR = /[a-z0-9'€™"%&#$]/i;
export const SPEAKER_ONSCREEN = /:/;
export const SPEAKER_OFFSCREEN = /-/;
export const ASIDE_START = /\(/;
export const ASIDE_END = /\)/;
export const PUNCTUATION_FLOW = /[,—;/\/]/;
export const PUNCTUATION_END = /[.!?]/;
export const SCREEN_DIRECTION_START = /\[/;
export const SCREEN_DIRECTION_END = /]/;