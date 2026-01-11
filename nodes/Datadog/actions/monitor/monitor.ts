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
} from '../../transport/requestHelper';
import { MONITOR_TYPES } from '../../constants/constants';

export const monitorOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new monitor',
        action: 'Create a monitor',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many monitors',
        action: 'Get many monitors',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific monitor',
        action: 'Get a monitor',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a monitor',
        action: 'Update a monitor',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a monitor',
        action: 'Delete a monitor',
      },
      {
        name: 'Validate',
        value: 'validate',
        description: 'Validate a monitor configuration',
        action: 'Validate a monitor',
      },
      {
        name: 'Mute',
        value: 'mute',
        description: 'Mute a monitor',
        action: 'Mute a monitor',
      },
      {
        name: 'Unmute',
        value: 'unmute',
        description: 'Unmute a monitor',
        action: 'Unmute a monitor',
      },
      {
        name: 'Mute All',
        value: 'muteAll',
        description: 'Mute all monitors',
        action: 'Mute all monitors',
      },
      {
        name: 'Unmute All',
        value: 'unmuteAll',
        description: 'Unmute all monitors',
        action: 'Unmute all monitors',
      },
      {
        name: 'Search Groups',
        value: 'searchGroups',
        description: 'Search monitor groups',
        action: 'Search monitor groups',
      },
      {
        name: 'Force Delete',
        value: 'forceDelete',
        description: 'Force delete a monitor',
        action: 'Force delete a monitor',
      },
    ],
    default: 'getAll',
  },
];

export const monitorFields: INodeProperties[] = [
  // Monitor ID for single operations
  {
    displayName: 'Monitor ID',
    name: 'monitorId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['get', 'update', 'delete', 'mute', 'unmute', 'forceDelete'],
      },
    },
    default: 0,
    description: 'The ID of the monitor',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['monitor'],
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
        resource: ['monitor'],
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
        resource: ['monitor'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Group States',
        name: 'group_states',
        type: 'string',
        default: '',
        description: 'Filter by group states (comma-separated: alert, warn, no data, ok)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by monitor name',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Filter by tags (comma-separated)',
      },
      {
        displayName: 'Monitor Tags',
        name: 'monitor_tags',
        type: 'string',
        default: '',
        description: 'Filter by monitor tags (comma-separated)',
      },
      {
        displayName: 'With Downtimes',
        name: 'with_downtimes',
        type: 'boolean',
        default: false,
        description: 'Whether to include downtime information',
      },
      {
        displayName: 'ID Offset',
        name: 'id_offset',
        type: 'number',
        default: 0,
        description: 'ID offset for pagination',
      },
    ],
  },

  // Create/Update fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the monitor',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['create'],
      },
    },
    options: MONITOR_TYPES,
    default: 'metric alert',
    description: 'The type of the monitor',
  },
  {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['create'],
      },
    },
    default: '',
    placeholder: 'avg(last_5m):avg:system.cpu.user{*} > 80',
    description: 'The monitor query',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Notification message (supports @-mentions)',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 5,
        },
        default: 3,
        description: 'Alert priority (1-5)',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'json',
        default: '{}',
        description: 'Monitor options as JSON (thresholds, notify_no_data, etc.)',
      },
      {
        displayName: 'Restricted Roles',
        name: 'restricted_roles',
        type: 'string',
        default: '',
        description: 'Comma-separated list of role IDs',
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
        resource: ['monitor'],
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
        description: 'The name of the monitor',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: MONITOR_TYPES,
        default: 'metric alert',
        description: 'The type of the monitor',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'The monitor query',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Notification message',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 5,
        },
        default: 3,
        description: 'Alert priority (1-5)',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'json',
        default: '{}',
        description: 'Monitor options as JSON',
      },
    ],
  },

  // Validate fields
  {
    displayName: 'Monitor Configuration',
    name: 'monitorConfig',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['validate'],
      },
    },
    default: '{\n  "name": "Test Monitor",\n  "type": "metric alert",\n  "query": "avg(last_5m):avg:system.cpu.user{*} > 80"\n}',
    description: 'Monitor configuration to validate',
  },

  // Mute options
  {
    displayName: 'Mute Options',
    name: 'muteOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['mute'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'End',
        name: 'end',
        type: 'dateTime',
        default: '',
        description: 'When the mute should end',
      },
      {
        displayName: 'Scope',
        name: 'scope',
        type: 'string',
        default: '',
        description: 'Scope to mute (e.g., host:myhost)',
      },
    ],
  },

  // Search Groups
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['searchGroups'],
      },
    },
    default: '',
    placeholder: 'status:alert',
    description: 'Query string to search for monitor groups',
  },
  {
    displayName: 'Additional Options',
    name: 'searchOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['monitor'],
        operation: ['searchGroups'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Per Page',
        name: 'per_page',
        type: 'number',
        default: 50,
        description: 'Number of results per page',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 0,
        description: 'Page number to fetch',
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'string',
        default: '',
        description: 'Sort field and direction',
      },
    ],
  },
];

export async function executeMonitorOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const name = this.getNodeParameter('name', i) as string;
    const type = this.getNodeParameter('type', i) as string;
    const query = this.getNodeParameter('query', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      name,
      type,
      query,
    };

    if (additionalFields.message) {
      body.message = additionalFields.message;
    }
    if (additionalFields.tags) {
      body.tags = prepareTagsArray(additionalFields.tags);
    }
    if (additionalFields.priority) {
      body.priority = additionalFields.priority;
    }
    if (additionalFields.options) {
      body.options = parseJsonParameter(additionalFields.options);
    }
    if (additionalFields.restricted_roles) {
      body.restricted_roles = prepareTagsArray(additionalFields.restricted_roles);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/monitor', body);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.group_states) {
      query.group_states = filters.group_states;
    }
    if (filters.name) {
      query.name = filters.name;
    }
    if (filters.tags) {
      query.tags = filters.tags;
    }
    if (filters.monitor_tags) {
      query.monitor_tags = filters.monitor_tags;
    }
    if (filters.with_downtimes) {
      query.with_downtimes = filters.with_downtimes;
    }
    if (filters.id_offset) {
      query.id_offset = filters.id_offset;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'monitors',
        'GET',
        '/monitor',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.page_size = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/monitor', {}, query);
      if (Array.isArray(responseData)) {
        responseData = responseData.slice(0, limit);
      }
    }
  }

  if (operation === 'get') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    responseData = await datadogApiRequest.call(this, 'GET', `/monitor/${monitorId}`);
  }

  if (operation === 'update') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    const body: Record<string, any> = {};

    if (updateFields.name) {
      body.name = updateFields.name;
    }
    if (updateFields.type) {
      body.type = updateFields.type;
    }
    if (updateFields.query) {
      body.query = updateFields.query;
    }
    if (updateFields.message) {
      body.message = updateFields.message;
    }
    if (updateFields.tags) {
      body.tags = prepareTagsArray(updateFields.tags);
    }
    if (updateFields.priority) {
      body.priority = updateFields.priority;
    }
    if (updateFields.options) {
      body.options = parseJsonParameter(updateFields.options);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/monitor/${monitorId}`, body);
  }

  if (operation === 'delete') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    responseData = await datadogApiRequest.call(this, 'DELETE', `/monitor/${monitorId}`);
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_monitor_id: monitorId };
    }
  }

  if (operation === 'validate') {
    const monitorConfig = this.getNodeParameter('monitorConfig', i) as string;
    const body = parseJsonParameter(monitorConfig);

    responseData = await datadogApiRequest.call(this, 'POST', '/monitor/validate', body);
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { valid: true, message: 'Monitor configuration is valid' };
    }
  }

  if (operation === 'mute') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    const muteOptions = this.getNodeParameter('muteOptions', i) as Record<string, any>;

    const body: Record<string, any> = {};
    if (muteOptions.end) {
      body.end = Math.floor(new Date(muteOptions.end).getTime() / 1000);
    }
    if (muteOptions.scope) {
      body.scope = muteOptions.scope;
    }

    responseData = await datadogApiRequest.call(this, 'POST', `/monitor/${monitorId}/mute`, body);
  }

  if (operation === 'unmute') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    responseData = await datadogApiRequest.call(this, 'POST', `/monitor/${monitorId}/unmute`);
  }

  if (operation === 'muteAll') {
    responseData = await datadogApiRequest.call(this, 'POST', '/monitor/mute_all');
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { status: 'ok', message: 'All monitors muted' };
    }
  }

  if (operation === 'unmuteAll') {
    responseData = await datadogApiRequest.call(this, 'POST', '/monitor/unmute_all');
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { status: 'ok', message: 'All monitors unmuted' };
    }
  }

  if (operation === 'searchGroups') {
    const searchQuery = this.getNodeParameter('searchQuery', i) as string;
    const searchOptions = this.getNodeParameter('searchOptions', i) as Record<string, any>;

    const query: Record<string, any> = {
      query: searchQuery,
    };
    if (searchOptions.per_page) {
      query.per_page = searchOptions.per_page;
    }
    if (searchOptions.page !== undefined) {
      query.page = searchOptions.page;
    }
    if (searchOptions.sort) {
      query.sort = searchOptions.sort;
    }

    responseData = await datadogApiRequest.call(this, 'GET', '/monitor/groups/search', {}, query);
  }

  if (operation === 'forceDelete') {
    const monitorId = this.getNodeParameter('monitorId', i) as number;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/monitor/${monitorId}`,
      {},
      { force: true },
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_monitor_id: monitorId, force: true };
    }
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
