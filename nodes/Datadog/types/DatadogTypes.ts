/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export type DatadogRegion = 'US1' | 'US3' | 'US5' | 'EU' | 'AP1' | 'US1-FED';

export interface DatadogCredentials {
  apiKey: string;
  applicationKey: string;
  region: DatadogRegion;
}

export interface DatadogApiResponse<T = any> {
  data?: T;
  errors?: string[];
  meta?: {
    page?: {
      after?: string;
      total_count?: number;
    };
  };
}

// Metric types
export interface MetricMetadata {
  metric: string;
  type?: string;
  description?: string;
  short_name?: string;
  unit?: string;
  per_unit?: string;
  statsd_interval?: number;
}

export interface MetricSeries {
  metric: string;
  type: 'gauge' | 'rate' | 'count' | 'distribution';
  points: Array<[number, number]> | Array<{ timestamp: number; value: number }>;
  host?: string;
  tags?: string[];
  unit?: string;
  interval?: number;
}

export interface MetricQuery {
  query: string;
  from: number;
  to: number;
}

// Monitor types
export type MonitorType =
  | 'metric alert'
  | 'query alert'
  | 'service check'
  | 'event alert'
  | 'log alert'
  | 'process alert'
  | 'rum alert'
  | 'trace-analytics alert'
  | 'slo alert'
  | 'composite';

export interface MonitorOptions {
  thresholds?: {
    critical?: number;
    warning?: number;
    ok?: number;
    critical_recovery?: number;
    warning_recovery?: number;
  };
  notify_no_data?: boolean;
  no_data_timeframe?: number;
  notify_audit?: boolean;
  timeout_h?: number;
  renotify_interval?: number;
  escalation_message?: string;
  include_tags?: boolean;
  require_full_window?: boolean;
  new_host_delay?: number;
  evaluation_delay?: number;
  silenced?: Record<string, number>;
}

export interface Monitor {
  id?: number;
  name: string;
  type: MonitorType;
  query: string;
  message?: string;
  tags?: string[];
  options?: MonitorOptions;
  priority?: number;
  restricted_roles?: string[];
  overall_state?: string;
  created?: string;
  modified?: string;
}

// Dashboard types
export type DashboardLayoutType = 'ordered' | 'free';

export interface DashboardWidget {
  id?: number;
  definition: Record<string, any>;
  layout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Dashboard {
  id?: string;
  title: string;
  description?: string;
  widgets: DashboardWidget[];
  layout_type: DashboardLayoutType;
  is_read_only?: boolean;
  notify_list?: string[];
  reflow_type?: 'auto' | 'fixed';
  template_variables?: Array<{
    name: string;
    prefix?: string;
    default?: string;
    available_values?: string[];
  }>;
  tags?: string[];
  created_at?: string;
  modified_at?: string;
  author_handle?: string;
  url?: string;
}

// Event types
export type EventPriority = 'normal' | 'low';
export type EventAlertType =
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'user_update'
  | 'recommendation'
  | 'snapshot';

export interface DatadogEvent {
  id?: number;
  title: string;
  text: string;
  date_happened?: number;
  priority?: EventPriority;
  host?: string;
  tags?: string[];
  alert_type?: EventAlertType;
  aggregation_key?: string;
  source_type_name?: string;
  device_name?: string;
}

// Log types
export interface LogEntry {
  message: string;
  ddsource?: string;
  ddtags?: string;
  hostname?: string;
  service?: string;
}

export interface LogIndex {
  name: string;
  filter?: {
    query?: string;
  };
  retention_days?: number;
  daily_limit?: number;
  exclusion_filters?: Array<{
    name: string;
    filter: {
      query: string;
      sample_rate: number;
    };
    is_enabled: boolean;
  }>;
}

export interface LogPipeline {
  id?: string;
  name: string;
  is_enabled?: boolean;
  filter?: {
    query: string;
  };
  processors?: Array<Record<string, any>>;
}

// APM/Traces types
export interface TraceQuery {
  query?: string;
  from: string;
  to: string;
  env?: string;
  service?: string;
  operation_name?: string;
  resource_name?: string;
  limit?: number;
  sort?: string;
}

export interface TracedService {
  service_name: string;
  env: string;
}

// Synthetics types
export type SyntheticsTestType = 'api' | 'browser';
export type SyntheticsTestStatus = 'live' | 'paused';

export interface SyntheticsTest {
  public_id?: string;
  name: string;
  type: SyntheticsTestType;
  status?: SyntheticsTestStatus;
  config: {
    request?: {
      method?: string;
      url?: string;
      body?: string;
      headers?: Record<string, string>;
    };
    assertions?: Array<{
      type: string;
      operator: string;
      target?: any;
    }>;
  };
  locations: string[];
  options?: {
    tick_every?: number;
    retry?: {
      count?: number;
      interval?: number;
    };
    min_location_failed?: number;
    min_failure_duration?: number;
    follow_redirects?: boolean;
    monitor_options?: {
      renotify_interval?: number;
    };
  };
  message?: string;
  tags?: string[];
}

export interface SyntheticsGlobalVariable {
  id?: string;
  name: string;
  value: {
    value?: string;
    secure?: boolean;
  };
  description?: string;
  tags?: string[];
  parse_test_public_ids?: string[];
  parse_test_options?: {
    type: string;
    field?: string;
    parser?: {
      type: string;
      value?: string;
    };
  };
}

// Incident types
export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4' | 'SEV-5';
export type IncidentState = 'active' | 'stable' | 'resolved';

export interface Incident {
  id?: string;
  attributes: {
    title: string;
    severity?: IncidentSeverity;
    state?: IncidentState;
    customer_impact_scope?: string;
    customer_impacted?: boolean;
    detected?: string;
    resolved?: string;
    fields?: Record<string, any>;
    notification_handles?: Array<{
      handle: string;
    }>;
  };
  type: 'incidents';
}

export interface IncidentTimelineCell {
  id?: string;
  attributes: {
    cell_type: 'markdown' | 'incident_update';
    content?: {
      content?: string;
    };
  };
  type: 'incident_timeline_cells';
}

// SLO types
export type SLOType = 'metric' | 'monitor';

export interface SLOThreshold {
  target: number;
  target_display?: string;
  timeframe: '7d' | '30d' | '90d' | 'custom';
  warning?: number;
  warning_display?: string;
}

export interface SLO {
  id?: string;
  name: string;
  description?: string;
  type: SLOType;
  monitor_ids?: number[];
  query?: {
    numerator: string;
    denominator: string;
  };
  thresholds: SLOThreshold[];
  tags?: string[];
  groups?: string[];
  created_at?: number;
  modified_at?: number;
}

export interface SLOCorrection {
  id?: string;
  attributes: {
    slo_id: string;
    category: 'Scheduled Maintenance' | 'Outside Business Hours' | 'Deployment' | 'Other';
    description?: string;
    start: number;
    end: number;
    timezone?: string;
    rrule?: string;
  };
  type: 'correction';
}

// Notebook types
export type NotebookCellType = 'markdown' | 'timeseries' | 'query_value' | 'toplist' | 'heatmap';

export interface NotebookCell {
  attributes: {
    definition: {
      type: NotebookCellType;
      text?: string;
      requests?: any[];
    };
  };
  id?: string;
  type: 'notebook_cells';
}

export interface Notebook {
  id?: number;
  attributes: {
    name: string;
    cells: NotebookCell[];
    time?: {
      live_span?: string;
    };
    status?: 'published' | 'draft';
    metadata?: {
      is_template?: boolean;
      take_snapshots?: boolean;
    };
  };
  type: 'notebooks';
}

// Downtime types
export interface DowntimeRecurrence {
  type?: 'days' | 'weeks' | 'months' | 'years';
  period?: number;
  week_days?: string[];
  until_date?: number;
  until_occurrences?: number;
}

export interface Downtime {
  id?: number;
  scope: string[];
  monitor_id?: number;
  monitor_tags?: string[];
  start?: number;
  end?: number;
  message?: string;
  timezone?: string;
  mute_first_recovery_notification?: boolean;
  recurrence?: DowntimeRecurrence;
  disabled?: boolean;
  active?: boolean;
}

// User types
export interface User {
  id?: string;
  attributes: {
    email: string;
    name?: string;
    title?: string;
    disabled?: boolean;
    verified?: boolean;
    service_account?: boolean;
  };
  relationships?: {
    roles?: {
      data: Array<{
        id: string;
        type: 'roles';
      }>;
    };
  };
  type: 'users';
}

export interface Role {
  id?: string;
  attributes: {
    name: string;
    user_count?: number;
    created_at?: string;
    modified_at?: string;
  };
  relationships?: {
    permissions?: {
      data: Array<{
        id: string;
        type: 'permissions';
      }>;
    };
  };
  type: 'roles';
}

export interface Permission {
  id: string;
  attributes: {
    name: string;
    display_name?: string;
    description?: string;
    group_name?: string;
    display_type?: string;
    restricted?: boolean;
  };
  type: 'permissions';
}

export interface Organization {
  id?: string;
  attributes: {
    name: string;
    description?: string;
    public_id?: string;
    settings?: Record<string, any>;
    created_at?: string;
    modified_at?: string;
  };
  type: 'orgs';
}

// Pagination types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

// API version type
export type ApiVersion = 'v1' | 'v2';

// Resource and operation types for the node
export type DatadogResource =
  | 'metric'
  | 'monitor'
  | 'dashboard'
  | 'event'
  | 'log'
  | 'apm'
  | 'synthetics'
  | 'incident'
  | 'slo'
  | 'notebook'
  | 'downtime'
  | 'user';
