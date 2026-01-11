/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import {
  datadogApiRequest,
  datadogApiRequestAllItems,
  parseJsonParameter,
  prepareTagsArray,
  toUnixTimestamp,
} from '../../transport/requestHelper';
import { METRIC_TYPES } from '../../constants/constants';

export const metricOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['metric'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'List many actively reporting metrics',
        action: 'Get many metrics',
      },
      {
        name: 'Get Metadata',
        value: 'getMetadata',
        description: 'Get metadata for a specific metric',
        action: 'Get metric metadata',
      },
      {
        name: 'Update Metadata',
        value: 'updateMetadata',
        description: 'Update metadata for a specific metric',
        action: 'Update metric metadata',
      },
      {
        name: 'Query',
        value: 'query',
        description: 'Query timeseries data for metrics',
        action: 'Query metrics',
      },
      {
        name: 'Submit',
        value: 'submit',
        description: 'Submit metric data points',
        action: 'Submit metrics',
      },
      {
        name: 'Get Active Tags',
        value: 'getActiveTags',
        description: 'Get active tags for a metric',
        action: 'Get active tags for metric',
      },
      {
        name: 'Get Tags',
        value: 'getTags',
        description: 'Get tag configuration for a metric',
        action: 'Get tags for metric',
      },
      {
        name: 'Update Tags',
        value: 'updateTags',
        description: 'Update tag configuration for a metric',
        action: 'Update tags for metric',
      },
      {
        name: 'Delete Tag Configuration',
        value: 'deleteTagConfig',
        description: 'Delete tag configuration for a metric',
        action: 'Delete tag configuration',
      },
      {
        name: 'Get Volumes',
        value: 'getVolumes',
        description: 'Get metric ingestion volumes',
        action: 'Get metric volumes',
      },
      {
        name: 'Estimate Cardinality',
        value: 'estimateCardinality',
        description: 'Estimate tag cardinality for a metric',
        action: 'Estimate metric cardinality',
      },
    ],
    default: 'getAll',
  },
];

export const metricFields: INodeProperties[] = [
  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
  },
  {
    displayName: 'From',
    name: 'from',
    type: 'dateTime',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getAll'],
      },
    },
    default: '',
    description: 'Only return metrics that have been active since this time',
  },
  {
    displayName: 'Host',
    name: 'host',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getAll'],
      },
    },
    default: '',
    description: 'Filter metrics by host',
  },
  {
    displayName: 'Tag Filter',
    name: 'tagFilter',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getAll'],
      },
    },
    default: '',
    description: 'Filter metrics by tag(s)',
  },

  // Get Metadata / Update Metadata / Get Tags / Update Tags / Delete Tag Config
  {
    displayName: 'Metric Name',
    name: 'metricName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: [
          'getMetadata',
          'updateMetadata',
          'getActiveTags',
          'getTags',
          'updateTags',
          'deleteTagConfig',
          'estimateCardinality',
        ],
      },
    },
    default: '',
    placeholder: 'system.cpu.user',
    description: 'The name of the metric',
  },

  // Update Metadata fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['updateMetadata'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Metric description',
      },
      {
        displayName: 'Per Unit',
        name: 'per_unit',
        type: 'string',
        default: '',
        description: 'Per unit of the metric (e.g., second)',
      },
      {
        displayName: 'Short Name',
        name: 'short_name',
        type: 'string',
        default: '',
        description: 'Short name for the metric',
      },
      {
        displayName: 'StatsD Interval',
        name: 'statsd_interval',
        type: 'number',
        default: 0,
        description: 'StatsD flush interval in seconds',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: METRIC_TYPES,
        default: 'gauge',
        description: 'Metric type',
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'string',
        default: '',
        description: 'Primary unit of the metric (e.g., byte, operation)',
      },
    ],
  },

  // Query fields
  {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['query'],
      },
    },
    default: '',
    placeholder: 'avg:system.cpu.user{*}',
    description: 'The metrics query string',
  },
  {
    displayName: 'From',
    name: 'fromTime',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['query'],
      },
    },
    default: '',
    description: 'Start time for the query (Unix timestamp or ISO date)',
  },
  {
    displayName: 'To',
    name: 'toTime',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['query'],
      },
    },
    default: '',
    description: 'End time for the query (Unix timestamp or ISO date)',
  },

  // Submit fields
  {
    displayName: 'Series',
    name: 'series',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['submit'],
      },
    },
    default: '[\n  {\n    "metric": "custom.metric.name",\n    "type": "gauge",\n    "points": [[1620000000, 100]],\n    "tags": ["env:production"]\n  }\n]',
    description: 'Array of metric series to submit',
  },

  // Update Tags fields
  {
    displayName: 'Tags',
    name: 'tags',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['updateTags'],
      },
    },
    default: '',
    placeholder: 'env:production,service:api',
    description: 'Comma-separated list of tags to configure for the metric',
  },

  // Estimate Cardinality options
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['estimateCardinality'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Filter Groups',
        name: 'filter_groups',
        type: 'string',
        default: '',
        description: 'Filter tag groups for cardinality estimation',
      },
      {
        displayName: 'Filter Tags',
        name: 'filter_tags',
        type: 'string',
        default: '',
        description: 'Filter tags for cardinality estimation',
      },
    ],
  },

  // Get Volumes options
  {
    displayName: 'Additional Options',
    name: 'volumeOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['metric'],
        operation: ['getVolumes'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Metric Name',
        name: 'metric_name',
        type: 'string',
        default: '',
        description: 'Filter volumes by metric name',
      },
    ],
  },
];

export async function executeMetricOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const from = this.getNodeParameter('from', i, '') as string;
    const host = this.getNodeParameter('host', i, '') as string;
    const tagFilter = this.getNodeParameter('tagFilter', i, '') as string;

    const query: Record<string, any> = {};
    if (from) {
      query.from = toUnixTimestamp(from);
    }
    if (host) {
      query.host = host;
    }
    if (tagFilter) {
      query.tag_filter = tagFilter;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'metrics',
        'GET',
        '/metrics',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      responseData = await datadogApiRequest.call(this, 'GET', '/metrics', {}, query);
      responseData = responseData.metrics?.slice(0, limit) || [];
    }
  }

  if (operation === 'getMetadata') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/metrics/${metricName}`);
  }

  if (operation === 'updateMetadata') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    responseData = await datadogApiRequest.call(
      this,
      'PUT',
      `/metrics/${metricName}`,
      updateFields,
    );
  }

  if (operation === 'query') {
    const query = this.getNodeParameter('query', i) as string;
    const fromTime = this.getNodeParameter('fromTime', i) as string;
    const toTime = this.getNodeParameter('toTime', i) as string;

    responseData = await datadogApiRequest.call(this, 'GET', '/query', {}, {
      query,
      from: toUnixTimestamp(fromTime),
      to: toUnixTimestamp(toTime),
    });
  }

  if (operation === 'submit') {
    const series = this.getNodeParameter('series', i) as string;
    const body = {
      series: parseJsonParameter(series),
    };

    responseData = await datadogApiRequest.call(this, 'POST', '/series', body);
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { status: 'ok', message: 'Metrics submitted successfully' };
    }
  }

  if (operation === 'getActiveTags') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/metrics/${metricName}/active-configurations`,
      {},
      {},
      'v2',
    );
  }

  if (operation === 'getTags') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/metrics/${metricName}/tags`,
      {},
      {},
      'v2',
    );
  }

  if (operation === 'updateTags') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    const tags = this.getNodeParameter('tags', i) as string;

    const body = {
      data: {
        type: 'manage_tags',
        id: metricName,
        attributes: {
          tags: prepareTagsArray(tags),
        },
      },
    };

    responseData = await datadogApiRequest.call(
      this,
      'PATCH',
      `/metrics/${metricName}/tags`,
      body,
      {},
      'v2',
    );
  }

  if (operation === 'deleteTagConfig') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/metrics/${metricName}/tags`,
      {},
      {},
      'v2',
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { status: 'ok', message: 'Tag configuration deleted successfully' };
    }
  }

  if (operation === 'getVolumes') {
    const volumeOptions = this.getNodeParameter('volumeOptions', i, {}) as Record<string, any>;
    const query: Record<string, any> = {};

    if (volumeOptions.metric_name) {
      query.metric_name = volumeOptions.metric_name;
    }

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      '/metrics/config/estimates',
      {},
      query,
      'v2',
    );
  }

  if (operation === 'estimateCardinality') {
    const metricName = this.getNodeParameter('metricName', i) as string;
    const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as Record<string, any>;

    const query: Record<string, any> = {};
    if (additionalOptions.filter_groups) {
      query.filter_groups = additionalOptions.filter_groups;
    }
    if (additionalOptions.filter_tags) {
      query.filter_tags = additionalOptions.filter_tags;
    }

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/metrics/${metricName}/estimate`,
      {},
      query,
      'v2',
    );
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
