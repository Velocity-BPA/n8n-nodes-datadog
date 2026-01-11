/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  parseJsonParameter,
  prepareTagsArray,
  toUnixTimestamp,
  fromUnixTimestamp,
  formatDateForDatadog,
} from '../../nodes/Datadog/transport/requestHelper';

describe('Request Helper Functions', () => {
  describe('parseJsonParameter', () => {
    it('should parse valid JSON string', () => {
      const result = parseJsonParameter('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return object as-is if already an object', () => {
      const input = { key: 'value' };
      const result = parseJsonParameter(input);
      expect(result).toEqual(input);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => parseJsonParameter('invalid json')).toThrow();
    });
  });

  describe('prepareTagsArray', () => {
    it('should split comma-separated tags', () => {
      const result = prepareTagsArray('tag1,tag2,tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should trim whitespace from tags', () => {
      const result = prepareTagsArray('tag1, tag2, tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return array as-is if already an array', () => {
      const input = ['tag1', 'tag2'];
      const result = prepareTagsArray(input);
      expect(result).toEqual(input);
    });

    it('should handle empty string', () => {
      const result = prepareTagsArray('');
      expect(result).toEqual(['']);
    });
  });

  describe('toUnixTimestamp', () => {
    it('should convert date string to Unix timestamp', () => {
      const result = toUnixTimestamp('2024-01-01T00:00:00Z');
      expect(result).toBe(1704067200);
    });

    it('should return number as-is if already a number', () => {
      const result = toUnixTimestamp(1704067200);
      expect(result).toBe(1704067200);
    });
  });

  describe('fromUnixTimestamp', () => {
    it('should convert Unix timestamp to Date object', () => {
      const result = fromUnixTimestamp(1704067200);
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('formatDateForDatadog', () => {
    it('should format date as ISO string', () => {
      const result = formatDateForDatadog('2024-01-01T00:00:00Z');
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
