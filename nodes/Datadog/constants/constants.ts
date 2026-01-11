/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { DatadogRegion } from '../types/DatadogTypes';

export const REGION_URLS: Record<DatadogRegion, string> = {
  US1: 'https://api.datadoghq.com',
  US3: 'https://api.us3.datadoghq.com',
  US5: 'https://api.us5.datadoghq.com',
  EU: 'https://api.datadoghq.eu',
  AP1: 'https://api.ap1.datadoghq.com',
  'US1-FED': 'https://api.ddog-gov.com',
};

export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 1000;

export const METRIC_TYPES = [
  { name: 'Gauge', value: 'gauge' },
  { name: 'Rate', value: 'rate' },
  { name: 'Count', value: 'count' },
  { name: 'Distribution', value: 'distribution' },
];

export const MONITOR_TYPES = [
  { name: 'Metric Alert', value: 'metric alert' },
  { name: 'Query Alert', value: 'query alert' },
  { name: 'Service Check', value: 'service check' },
  { name: 'Event Alert', value: 'event alert' },
  { name: 'Log Alert', value: 'log alert' },
  { name: 'Process Alert', value: 'process alert' },
  { name: 'RUM Alert', value: 'rum alert' },
  { name: 'Trace Analytics Alert', value: 'trace-analytics alert' },
  { name: 'SLO Alert', value: 'slo alert' },
  { name: 'Composite', value: 'composite' },
];

export const EVENT_PRIORITIES = [
  { name: 'Normal', value: 'normal' },
  { name: 'Low', value: 'low' },
];

export const EVENT_ALERT_TYPES = [
  { name: 'Error', value: 'error' },
  { name: 'Warning', value: 'warning' },
  { name: 'Info', value: 'info' },
  { name: 'Success', value: 'success' },
  { name: 'User Update', value: 'user_update' },
  { name: 'Recommendation', value: 'recommendation' },
  { name: 'Snapshot', value: 'snapshot' },
];

export const DASHBOARD_LAYOUT_TYPES = [
  { name: 'Ordered', value: 'ordered' },
  { name: 'Free', value: 'free' },
];

export const SYNTHETICS_TEST_TYPES = [
  { name: 'API', value: 'api' },
  { name: 'Browser', value: 'browser' },
];

export const SYNTHETICS_TEST_STATUS = [
  { name: 'Live', value: 'live' },
  { name: 'Paused', value: 'paused' },
];

export const INCIDENT_SEVERITIES = [
  { name: 'SEV-1 (Critical)', value: 'SEV-1' },
  { name: 'SEV-2 (High)', value: 'SEV-2' },
  { name: 'SEV-3 (Medium)', value: 'SEV-3' },
  { name: 'SEV-4 (Low)', value: 'SEV-4' },
  { name: 'SEV-5 (Minor)', value: 'SEV-5' },
];

export const INCIDENT_SEVERITY_OPTIONS = INCIDENT_SEVERITIES;

export const INCIDENT_STATES = [
  { name: 'Active', value: 'active' },
  { name: 'Stable', value: 'stable' },
  { name: 'Resolved', value: 'resolved' },
];

export const INCIDENT_STATE_OPTIONS = INCIDENT_STATES;

export const SLO_TYPES = [
  { name: 'Metric', value: 'metric' },
  { name: 'Monitor', value: 'monitor' },
];

export const SLO_TYPE_OPTIONS = SLO_TYPES;

export const SLO_TIMEFRAMES = [
  { name: '7 Days', value: '7d' },
  { name: '30 Days', value: '30d' },
  { name: '90 Days', value: '90d' },
  { name: 'Custom', value: 'custom' },
];

export const SLO_TIMEFRAME_OPTIONS = SLO_TIMEFRAMES;

export const SLO_CORRECTION_CATEGORIES = [
  { name: 'Scheduled Maintenance', value: 'Scheduled Maintenance' },
  { name: 'Outside Business Hours', value: 'Outside Business Hours' },
  { name: 'Deployment', value: 'Deployment' },
  { name: 'Other', value: 'Other' },
];

export const NOTEBOOK_STATUS = [
  { name: 'Published', value: 'published' },
  { name: 'Draft', value: 'draft' },
];

export const DOWNTIME_RECURRENCE_TYPES = [
  { name: 'Days', value: 'days' },
  { name: 'Weeks', value: 'weeks' },
  { name: 'Months', value: 'months' },
  { name: 'Years', value: 'years' },
];

export const DOWNTIME_RECURRENCE_TYPE_OPTIONS = DOWNTIME_RECURRENCE_TYPES;

export const WEEK_DAYS = [
  { name: 'Monday', value: 'Mon' },
  { name: 'Tuesday', value: 'Tue' },
  { name: 'Wednesday', value: 'Wed' },
  { name: 'Thursday', value: 'Thu' },
  { name: 'Friday', value: 'Fri' },
  { name: 'Saturday', value: 'Sat' },
  { name: 'Sunday', value: 'Sun' },
];

export const HTTP_METHODS = [
  { name: 'GET', value: 'GET' },
  { name: 'POST', value: 'POST' },
  { name: 'PUT', value: 'PUT' },
  { name: 'PATCH', value: 'PATCH' },
  { name: 'DELETE', value: 'DELETE' },
  { name: 'HEAD', value: 'HEAD' },
  { name: 'OPTIONS', value: 'OPTIONS' },
];

export const SORT_ORDERS = [
  { name: 'Ascending', value: 'asc' },
  { name: 'Descending', value: 'desc' },
];

export const LICENSING_NOTICE = `
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`;
