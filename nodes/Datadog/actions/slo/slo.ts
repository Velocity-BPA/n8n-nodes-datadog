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
import { SLO_TYPE_OPTIONS } from '../../constants/constants';

export const sloOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['slo'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new SLO',
        action: 'Create an SLO',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many SLOs',
        action: 'Get many sl os',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific SLO',
        action: 'Get an SLO',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an SLO',
        action: 'Update an SLO',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an SLO',
        action: 'Delete an SLO',
      },
      {
        name: 'Get History',
        value: 'getHistory',
        description: 'Get SLO history',
        action: 'Get SLO history',
      },
      {
        name: 'Get Corrections',
        value: 'getCorrections',
        description: 'Get SLO corrections',
        action: 'Get SLO corrections',
      },
      {
        name: 'Create Correction',
        value: 'createCorrection',
        description: 'Create an SLO correction',
        action: 'Create SLO correction',
      },
      {
        name: 'Delete Correction',
        value: 'deleteCorrection',
        description: 'Delete an SLO correction',
        action: 'Delete SLO correction',
      },
    ],
    default: 'getAll',
  },
];

export const sloFields: INodeProperties[] = [
  // SLO ID
  {
    displayName: 'SLO ID',
    name: 'sloId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['get', 'update', 'delete', 'getHistory', 'getCorrections', 'createCorrection'],
      },
    },
    default: '',
    description: 'The ID of the SLO',
  },

  // Correction ID
  {
    displayName: 'Correction ID',
    name: 'correctionId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['deleteCorrection'],
      },
    },
    default: '',
    description: 'The ID of the SLO correction',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['slo'],
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
        resource: ['slo'],
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
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'IDs',
        name: 'ids',
        type: 'string',
        default: '',
        description: 'Comma-separated list of SLO IDs to filter by',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'Filter SLOs by search query',
      },
      {
        displayName: 'Tags Query',
        name: 'tags_query',
        type: 'string',
        default: '',
        description: 'Filter by tags (e.g., env:prod)',
      },
      {
        displayName: 'Metrics Query',
        name: 'metrics_query',
        type: 'string',
        default: '',
        description: 'Filter by metric-based SLO query',
      },
    ],
  },

  // Create fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the SLO',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
      },
    },
    options: SLO_TYPE_OPTIONS,
    default: 'metric',
    description: 'The type of the SLO',
  },
  {
    displayName: 'Thresholds',
    name: 'thresholds',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
      },
    },
    default: '[{"target": 99.0, "timeframe": "7d"}]',
    description: 'Array of SLO threshold definitions',
  },

  // Metric-based SLO fields
  {
    displayName: 'Query',
    name: 'query',
    type: 'json',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
        type: ['metric'],
      },
    },
    default: '{\n  "numerator": "sum:my.metric{type:good}.as_count()",\n  "denominator": "sum:my.metric{*}.as_count()"\n}',
    description: 'Query definition for metric-based SLO with numerator and denominator',
  },

  // Monitor-based SLO fields
  {
    displayName: 'Monitor IDs',
    name: 'monitorIds',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
        type: ['monitor'],
      },
    },
    default: '',
    description: 'Comma-separated list of monitor IDs for monitor-based SLO',
  },

  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the SLO',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Groups',
        name: 'groups',
        type: 'string',
        default: '',
        description: 'Comma-separated list of monitor group values',
      },
      {
        displayName: 'Target Threshold',
        name: 'target_threshold',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 99.0,
        description: 'Target threshold for the SLO (0-100)',
      },
      {
        displayName: 'Warning Threshold',
        name: 'warning_threshold',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 99.5,
        description: 'Warning threshold for the SLO (0-100)',
      },
    ],
  },

  // Update fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the SLO',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the SLO',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Thresholds',
        name: 'thresholds',
        type: 'json',
        default: '[]',
        description: 'Array of SLO threshold definitions',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'json',
        default: '{}',
        description: 'Query definition for metric-based SLO',
      },
      {
        displayName: 'Monitor IDs',
        name: 'monitor_ids',
        type: 'string',
        default: '',
        description: 'Comma-separated list of monitor IDs for monitor-based SLO',
      },
      {
        displayName: 'Groups',
        name: 'groups',
        type: 'string',
        default: '',
        description: 'Comma-separated list of monitor group values',
      },
    ],
  },

  // Get History fields
  {
    displayName: 'From Timestamp',
    name: 'fromTs',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['getHistory'],
      },
    },
    default: '',
    description: 'Start timestamp for the history query',
  },
  {
    displayName: 'To Timestamp',
    name: 'toTs',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['getHistory'],
      },
    },
    default: '',
    description: 'End timestamp for the history query',
  },
  {
    displayName: 'History Options',
    name: 'historyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['getHistory'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Target',
        name: 'target',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 99.0,
        description: 'Target for the SLO',
      },
      {
        displayName: 'Apply Correction',
        name: 'apply_correction',
        type: 'boolean',
        default: true,
        description: 'Whether to apply corrections to the history',
      },
    ],
  },

  // Create Correction fields
  {
    displayName: 'Correction Category',
    name: 'correctionCategory',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['createCorrection'],
      },
    },
    options: [
      { name: 'Scheduled Maintenance', value: 'Scheduled Maintenance' },
      { name: 'Outside Business Hours', value: 'Outside Business Hours' },
      { name: 'Deployment', value: 'Deployment' },
      { name: 'Other', value: 'Other' },
    ],
    default: 'Scheduled Maintenance',
    description: 'Category for the SLO correction',
  },
  {
    displayName: 'Start',
    name: 'correctionStart',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['createCorrection'],
      },
    },
    default: '',
    description: 'Start time of the correction',
  },
  {
    displayName: 'End',
    name: 'correctionEnd',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['createCorrection'],
      },
    },
    default: '',
    description: 'End time of the correction',
  },
  {
    displayName: 'Correction Options',
    name: 'correctionOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['slo'],
        operation: ['createCorrection'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the correction',
      },
      {
        displayName: 'Duration',
        name: 'duration',
        type: 'number',
        default: 0,
        description: 'Duration of the correction in seconds (alternative to end time)',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: 'UTC',
        description: 'Timezone for the correction (e.g., America/New_York)',
      },
    ],
  },
];

export async function executeSloOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const name = this.getNodeParameter('name', i) as string;
    const type = this.getNodeParameter('type', i) as string;
    const thresholds = this.getNodeParameter('thresholds', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      name,
      type,
      thresholds: parseJsonParameter(thresholds),
    };

    if (type === 'metric') {
      const query = this.getNodeParameter('query', i) as string;
      body.query = parseJsonParameter(query);
    }

    if (type === 'monitor') {
      const monitorIds = this.getNodeParameter('monitorIds', i, '') as string;
      if (monitorIds) {
        body.monitor_ids = monitorIds.split(',').map((id) => parseInt(id.trim(), 10));
      }
    }

    if (additionalFields.description) {
      body.description = additionalFields.description;
    }
    if (additionalFields.tags) {
      body.tags = prepareTagsArray(additionalFields.tags);
    }
    if (additionalFields.groups) {
      body.groups = prepareTagsArray(additionalFields.groups);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/slo', body);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.ids) {
      query.ids = filters.ids;
    }
    if (filters.query) {
      query.query = filters.query;
    }
    if (filters.tags_query) {
      query.tags_query = filters.tags_query;
    }
    if (filters.metrics_query) {
      query.metrics_query = filters.metrics_query;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'data',
        'GET',
        '/slo',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.limit = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/slo', {}, query);
      responseData = responseData.data?.slice(0, limit) || [];
    }
  }

  if (operation === 'get') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/slo/${sloId}`);
    responseData = responseData.data;
  }

  if (operation === 'update') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    // First get the existing SLO to preserve required fields
    const existingSlo = await datadogApiRequest.call(this, 'GET', `/slo/${sloId}`);
    const existing = existingSlo.data;

    const body: Record<string, any> = {
      name: updateFields.name || existing.name,
      type: existing.type,
      thresholds: updateFields.thresholds
        ? parseJsonParameter(updateFields.thresholds)
        : existing.thresholds,
    };

    if (existing.type === 'metric') {
      body.query = updateFields.query
        ? parseJsonParameter(updateFields.query)
        : existing.query;
    }

    if (existing.type === 'monitor') {
      if (updateFields.monitor_ids) {
        body.monitor_ids = updateFields.monitor_ids.split(',').map((id: string) => parseInt(id.trim(), 10));
      } else {
        body.monitor_ids = existing.monitor_ids;
      }
    }

    if (updateFields.description !== undefined) {
      body.description = updateFields.description;
    }
    if (updateFields.tags) {
      body.tags = prepareTagsArray(updateFields.tags);
    }
    if (updateFields.groups) {
      body.groups = prepareTagsArray(updateFields.groups);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/slo/${sloId}`, body);
    responseData = responseData.data?.[0] || responseData;
  }

  if (operation === 'delete') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    responseData = await datadogApiRequest.call(this, 'DELETE', `/slo/${sloId}`);
  }

  if (operation === 'getHistory') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    const fromTs = this.getNodeParameter('fromTs', i) as string;
    const toTs = this.getNodeParameter('toTs', i) as string;
    const historyOptions = this.getNodeParameter('historyOptions', i) as Record<string, any>;

    const query: Record<string, any> = {
      from_ts: toUnixTimestamp(fromTs),
      to_ts: toUnixTimestamp(toTs),
    };

    if (historyOptions.target !== undefined) {
      query.target = historyOptions.target;
    }
    if (historyOptions.apply_correction !== undefined) {
      query.apply_correction = historyOptions.apply_correction;
    }

    responseData = await datadogApiRequest.call(this, 'GET', `/slo/${sloId}/history`, {}, query);
    responseData = responseData.data;
  }

  if (operation === 'getCorrections') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'GET',
      '/slo/correction',
      {},
      { slo_ids: sloId },
    );
    responseData = responseData.data || [];
  }

  if (operation === 'createCorrection') {
    const sloId = this.getNodeParameter('sloId', i) as string;
    const category = this.getNodeParameter('correctionCategory', i) as string;
    const start = this.getNodeParameter('correctionStart', i) as string;
    const end = this.getNodeParameter('correctionEnd', i) as string;
    const correctionOptions = this.getNodeParameter('correctionOptions', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'correction',
        attributes: {
          slo_id: sloId,
          category,
          start: toUnixTimestamp(start),
          end: toUnixTimestamp(end),
        },
      },
    };

    if (correctionOptions.description) {
      body.data.attributes.description = correctionOptions.description;
    }
    if (correctionOptions.duration) {
      body.data.attributes.duration = correctionOptions.duration;
    }
    if (correctionOptions.timezone) {
      body.data.attributes.timezone = correctionOptions.timezone;
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/slo/correction', body);
    responseData = responseData.data;
  }

  if (operation === 'deleteCorrection') {
    const correctionId = this.getNodeParameter('correctionId', i) as string;
    await datadogApiRequest.call(this, 'DELETE', `/slo/correction/${correctionId}`);
    responseData = { deleted: true, correctionId };
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
