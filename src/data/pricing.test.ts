import { describe, expect, it } from 'vitest';
import { calculateFaresByCategory, calculateStandardFare, getNeighborhoodPath } from './pricing';

describe('calculateStandardFare', () => {
  it('prices an adjacent hop on the autoroute axis', () => {
    expect(calculateStandardFare('kaloum', 'madina')).toBe(3000);
  });

  it('prices an adjacent hop on the prince axis', () => {
    expect(calculateStandardFare('dixinn', 'hamdallaye')).toBe(2000);
  });

  it('sums consecutive hops along the same axis', () => {
    // madina -> aeroport (2000) -> sangoyah (3000)
    expect(calculateStandardFare('madina', 'sangoyah')).toBe(5000);
  });

  it('is symmetric regardless of travel direction', () => {
    expect(calculateStandardFare('madina', 'kaloum')).toBe(calculateStandardFare('kaloum', 'madina'));
  });

  it('routes through Kaloum when origin and destination sit on different axes', () => {
    // madina (autoroute) -> kaloum (3000) -> dixinn (prince, 3000)
    expect(calculateStandardFare('madina', 'dixinn')).toBe(6000);
  });
});

describe('calculateFaresByCategory', () => {
  it('derives every category from the STANDARD fare using the WONKHAI formulas', () => {
    const fares = calculateFaresByCategory('kaloum', 'madina');
    expect(fares.STANDARD).toBe(3000);
    expect(fares.LUXE).toBe(2500); // STANDARD - 500
    expect(fares.VIP).toBe(8000); // STANDARD + 5000
    expect(fares.MOTO_SINGLE).toBe(15000); // STANDARD * 5
  });

  it('never lets LUXE go negative on a very cheap route', () => {
    const fares = calculateFaresByCategory('kaloum', 'kaloum');
    expect(fares.LUXE).toBeGreaterThanOrEqual(0);
  });
});

describe('getNeighborhoodPath', () => {
  it('returns a single-element path when origin equals destination', () => {
    expect(getNeighborhoodPath('kaloum', 'kaloum')).toEqual(['kaloum']);
  });

  it('returns adjacent stops in travel order on the same axis', () => {
    expect(getNeighborhoodPath('kaloum', 'madina')).toEqual(['kaloum', 'madina']);
    expect(getNeighborhoodPath('madina', 'kaloum')).toEqual(['madina', 'kaloum']);
  });

  it('transits through Kaloum when crossing axes', () => {
    const path = getNeighborhoodPath('madina', 'dixinn');
    expect(path[0]).toBe('madina');
    expect(path[path.length - 1]).toBe('dixinn');
    expect(path).toContain('kaloum');
  });
});
