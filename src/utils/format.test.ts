import { describe, expect, it } from 'vitest';
import { formatDistance, formatDuration, formatFare, formatRelativeTime } from './format';

describe('formatFare', () => {
  it('formats a whole GNF amount with the FG suffix', () => {
    expect(formatFare(3000)).toBe(`${new Intl.NumberFormat('fr-FR').format(3000)} FG`);
  });

  it('rounds fractional amounts', () => {
    expect(formatFare(2999.6)).toBe(`${new Intl.NumberFormat('fr-FR').format(3000)} FG`);
  });
});

describe('formatDistance', () => {
  it('shows meters under 1 km', () => {
    expect(formatDistance(0.45)).toBe('450 m');
  });

  it('shows one decimal of km at 1 km or above', () => {
    expect(formatDistance(2.6)).toBe('2.6 km');
  });
});

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(28)).toBe('28 min');
  });

  it('shows padded hours and minutes at 60+', () => {
    expect(formatDuration(65)).toBe('1 h 05');
  });
});

describe('formatRelativeTime', () => {
  function isoMinutesAgo(minutes: number): string {
    return new Date(Date.now() - minutes * 60_000).toISOString();
  }

  it('shows "à l\'instant" for anything under a minute old', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe("à l'instant");
  });

  it('shows minutes for anything under an hour old', () => {
    expect(formatRelativeTime(isoMinutesAgo(15))).toBe('il y a 15 min');
  });

  it('shows hours for anything under a day old', () => {
    expect(formatRelativeTime(isoMinutesAgo(180))).toBe('il y a 3 h');
  });
});
