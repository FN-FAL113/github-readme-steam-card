export const TEXT_LIMITS = {
  USERNAME: 20,
  USERNAME_TRUNCATE: 16,
  GAME_NAME: 30,
  IN_GAME_TRUNCATE: 26,
  RECENT_GAME_TRUNCATE: 26,
} as const;

export const GAME_BG_DIMENSIONS = {
  x: '350',
  y: '68',
  width: '128px',
  height: '128px',
} as const;

export type GAME_BG_DIMENSIONS_TYPE = typeof GAME_BG_DIMENSIONS;

export const FALLBACK_BG_DIMENSIONS = {
  x: '414',
  y: '100',
  width: '64px',
  height: '64px',
} as const;

export type FALLBACK_BG_DIMENSIONS_TYPE = typeof FALLBACK_BG_DIMENSIONS;

