/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import {
  datadogApiRequest,
  prepareTagsArray,
  toUnixTimestamp,
} from '../../transport/requestHelper';
import { EVENT_PRIORITIES, EVENT_ALERT_TYPES } from '../../constants/constants';

export const eventOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['event'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Post a new event',
        action: 'Create an event',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Query events',
        action: 'Get many events',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific event',
        action: 'Get an event',
      },
    ],
    default: 'getAll',
  },
];

export const eventFields: INodeProperties[] = [
  // Event ID for get
  {
    displayName: 'Event ID',
    name: 'eventId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['get'],
      },
    },
    default: 0,
    description: 'The ID of the event',
  },

  // Get All options
  {
    displayName: 'Start',
    name: 'start',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getAll'],
      },
    },
    default: '',
    description: 'Start date/time for the query',
  },
  {
    displayName: 'End',
    name: 'end',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getAll'],
      },
    },
    default: '',
    description: 'End date/time for the query',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: EVENT_PRIORITIES,
        default: 'normal',
        description: 'Filter by event priority',
      },
      {
        displayName: 'Sources',
        name: 'sources',
        type: 'string',
        default: '',
        description: 'Comma-separated list of sources',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Unaggregated',
        name: 'unaggregated',
        type: 'boolean',
        default: false,
        description: 'Whether to return unaggregated events',
      },
      {
        displayName: 'Exclude Aggregate',
        name: 'exclude_aggregate',
        type: 'boolean',
        default: false,
        description: 'Whether to exclude aggregate events',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 0,
        description: 'Page number for pagination',
      },
    ],
  },

  // Create fields
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The title of the event',
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    required: true,
    typeOptions: {
      rows: 4,
    },
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The body/text of the event (supports Markdown)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Date Happened',
        name: 'date_happened',
        type: 'dateTime',
        default: '',
        description: 'When the event occurred (defaults to now)',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: EVENT_PRIORITIES,
        default: 'normal',
        description: 'Event priority',
      },
      {
        displayName: 'Host',
        name: 'host',
        type: 'string',
        default: '',
        description: 'Host associated with the event',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Alert Type',
        name: 'alert_type',
        type: 'options',
        options: EVENT_ALERT_TYPES,
        default: 'info',
        description: 'Type of alert',
      },
      {
        displayName: 'Aggregation Key',
        name: 'aggregation_key',
        type: 'string',
        default: '',
        description: 'Key for aggregating similar events',
      },
      {
        displayName: 'Source Type Name',
        name: 'source_type_name',
        type: 'string',
        default: '',
        description: 'Source type of the event',
      },
      {
        displayName: 'Device Name',
        name: 'device_name',
        type: 'string',
        default: '',
        description: 'Device associated with the event',
      },
    ],
  },
];

export async function executeEventOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const title = this.getNodeParameter('title', i) as string;
    const text = this.getNodeParameter('text', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      title,
      text,
    };

    if (additionalFields.date_happened) {
      body.date_happened = toUnixTimestamp(additionalFields.date_happened);
    }
    if (additionalFields.priority) {
      body.priority = additionalFields.priority;
    }
    if (additionalFields.host) {
      body.host = additionalFields.host;
    }
    if (additionalFields.tags) {
      body.tags = prepareTagsArray(additionalFields.tags);
    }
    if (additionalFields.alert_type) {
      body.alert_type = additionalFields.alert_type;
    }
    if (additionalFields.aggregation_key) {
      body.aggregation_key = additionalFields.aggregation_key;
    }
    if (additionalFields.source_type_name) {
      body.source_type_name = additionalFields.source_type_name;
    }
    if (additionalFields.device_name) {
      body.device_name = additionalFields.device_name;
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/events', body);
  }

  if (operation === 'getAll') {
    const start = this.getNodeParameter('start', i) as string;
    const end = this.getNodeParameter('end', i) as string;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {
      start: toUnixTimestamp(start),
      end: toUnixTimestamp(end),
    };

    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.sources) {
      query.sources = filters.sources;
    }
    if (filters.tags) {
      query.tags = filters.tags;
    }
    if (filters.unaggregated !== undefined) {
      query.unaggregated = filters.unaggregated;
    }
    if (filters.exclude_aggregate !== undefined) {
      query.exclude_aggregate = filters.exclude_aggregate;
    }
    if (filters.page !== undefined) {
      query.page = filters.page;
    }

    responseData = await datadogApiRequest.call(this, 'GET', '/events', {}, query);
    responseData = responseData.events || [];
  }

  if (operation === 'get') {
    const eventId = this.getNodeParameter('eventId', i) as number;
    responseData = await datadogApiRequest.call(this, 'GET', `/events/${eventId}`);
    responseData = responseData.event || responseData;
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
