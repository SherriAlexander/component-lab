import { describe, expect, test } from 'vitest';
import { contrastRatio } from './contrast';
import tokens from './tokens.json';

describe('contrastRatio', () => {
  test('matches known WCAG values', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
});

describe('neutral', () => {
  const n = tokens.neutral;
  describe.each([
    ['surface', n.surface],
    ['surface-muted', n['surface-muted']],
  ])('on %s', (_, surface) => {
    test.each([
      ['text', n.text, 4.5],
      ['text-muted', n['text-muted'], 4.5],
      ['border', n.border, 3],
      ['focus', n.focus, 3],
    ])('%s ≥ %s:1', (_, color, min) => {
      expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(min);
    });
  });
});

describe.each(Object.entries(tokens.accent))('accent %s', (_, { start, end, on }) => {
  test.each([
    ['start', start],
    ['end', end],
  ])('on-accent vs %s stop ≥ 4.5:1', (_, stop) => {
    expect(contrastRatio(on, stop)).toBeGreaterThanOrEqual(4.5);
  });
});
