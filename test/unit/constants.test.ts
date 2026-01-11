/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  REGION_URLS,
  MONITOR_TYPES,
  METRIC_TYPES,
  DASHBOARD_LAYOUT_TYPES,
  INCIDENT_SEVERITY_OPTIONS,
  INCIDENT_STATE_OPTIONS,
  SLO_TYPE_OPTIONS,
} from '../../nodes/Datadog/constants/constants';

describe('Datadog Constants', () => {
  describe('REGION_URLS', () => {
    it('should have correct US1 URL', () => {
      expect(REGION_URLS.US1).toBe('https://api.datadoghq.com');
    });

    it('should have correct EU URL', () => {
      expect(REGION_URLS.EU).toBe('https://api.datadoghq.eu');
    });

    it('should have correct US3 URL', () => {
      expect(REGION_URLS.US3).toBe('https://api.us3.datadoghq.com');
    });

    it('should have correct US5 URL', () => {
      expect(REGION_URLS.US5).toBe('https://api.us5.datadoghq.com');
    });

    it('should have correct AP1 URL', () => {
      expect(REGION_URLS.AP1).toBe('https://api.ap1.datadoghq.com');
    });

    it('should have correct US1-FED URL', () => {
      expect(REGION_URLS['US1-FED']).toBe('https://api.ddog-gov.com');
    });

    it('should have all 6 regions', () => {
      expect(Object.keys(REGION_URLS).length).toBe(6);
    });
  });

  describe('MONITOR_TYPES', () => {
    it('should have metric alert option', () => {
      const metricAlert = MONITOR_TYPES.find((opt: { value: string }) => opt.value === 'metric alert');
      expect(metricAlert).toBeDefined();
    });

    it('should have query alert option', () => {
      const queryAlert = MONITOR_TYPES.find((opt: { value: string }) => opt.value === 'query alert');
      expect(queryAlert).toBeDefined();
    });
  });

  describe('METRIC_TYPES', () => {
    it('should have gauge option', () => {
      const gauge = METRIC_TYPES.find((opt: { value: string }) => opt.value === 'gauge');
      expect(gauge).toBeDefined();
    });

    it('should have count option', () => {
      const count = METRIC_TYPES.find((opt: { value: string }) => opt.value === 'count');
      expect(count).toBeDefined();
    });

    it('should have rate option', () => {
      const rate = METRIC_TYPES.find((opt: { value: string }) => opt.value === 'rate');
      expect(rate).toBeDefined();
    });
  });

  describe('DASHBOARD_LAYOUT_TYPES', () => {
    it('should have ordered option', () => {
      const ordered = DASHBOARD_LAYOUT_TYPES.find((opt: { value: string }) => opt.value === 'ordered');
      expect(ordered).toBeDefined();
    });

    it('should have free option', () => {
      const free = DASHBOARD_LAYOUT_TYPES.find((opt: { value: string }) => opt.value === 'free');
      expect(free).toBeDefined();
    });
  });

  describe('INCIDENT_SEVERITY_OPTIONS', () => {
    it('should have SEV-1 through SEV-5', () => {
      expect(INCIDENT_SEVERITY_OPTIONS.length).toBe(5);
    });
  });

  describe('INCIDENT_STATE_OPTIONS', () => {
    it('should have active, stable, and resolved states', () => {
      const states = INCIDENT_STATE_OPTIONS.map(opt => opt.value);
      expect(states).toContain('active');
      expect(states).toContain('stable');
      expect(states).toContain('resolved');
    });
  });

  describe('SLO_TYPE_OPTIONS', () => {
    it('should have metric and monitor types', () => {
      const types = SLO_TYPE_OPTIONS.map(opt => opt.value);
      expect(types).toContain('metric');
      expect(types).toContain('monitor');
    });
  });
});
