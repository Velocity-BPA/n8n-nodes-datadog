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
import { DOWNTIME_RECURRENCE_TYPE_OPTIONS } from '../../constants/constants';

export const downtimeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['downtime'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Schedule a downtime',
        action: 'Create a downtime',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many downtimes',
        action: 'Get many downtimes',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific downtime',
        action: 'Get a downtime',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a downtime',
        action: 'Update a downtime',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a downtime',
        action: 'Cancel a downtime',
      },
    ],
    default: 'getAll',
  },
];

export const downtimeFields: INodeProperties[] = [
  // Downtime ID
  {
    displayName: 'Downtime ID',
    name: 'downtimeId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['downtime'],
        operation: ['get', 'update', 'cancel'],
      },
    },
    default: 0,
    description: 'The ID of the downtime',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['downtime'],
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
        resource: ['downtime'],
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
        resource: ['downtime'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Current Only',
        name: 'current_only',
        type: 'boolean',
        default: false,
        description: 'Whether to only return currently active downtimes',
      },
      {
        displayName: 'With Creator',
        name: 'with_creator',
        type: 'boolean',
        default: false,
        description: 'Whether to include creator information',
      },
    ],
  },

  // Create fields
  {
    displayName: 'Scope',
    name: 'scope',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['downtime'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Comma-separated list of scope tags (e.g., env:prod,host:web-1)',
  },
  {
    displayName: 'Start Time',
    name: 'start',
    type: 'dateTime',
    displayOptions: {
      show: {
        resource: ['downtime'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Start time for the downtime (leave empty for immediate)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['downtime'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'End Time',
        name: 'end',
        type: 'dateTime',
        default: '',
        description: 'End time for the downtime (leave empty for indefinite)',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Message describing the downtime',
      },
      {
        displayName: 'Monitor ID',
        name: 'monitor_id',
        type: 'number',
        default: 0,
        description: 'Specific monitor ID to mute (0 for all monitors)',
      },
      {
        displayName: 'Monitor Tags',
        name: 'monitor_tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of monitor tags to filter',
      },
      {
        displayName: 'Mute First Recovery Notification',
        name: 'mute_first_recovery_notification',
        type: 'boolean',
        default: false,
        description: 'Whether to mute the first recovery notification',
      },
      {
        displayName: 'Notify End States',
        name: 'notify_end_states',
        type: 'multiOptions',
        options: [
          { name: 'Alert', value: 'alert' },
          { name: 'No Data', value: 'no data' },
          { name: 'Warn', value: 'warn' },
        ],
        default: [],
        description: 'States to notify about at the end of downtime',
      },
      {
        displayName: 'Notify End Types',
        name: 'notify_end_types',
        type: 'multiOptions',
        options: [
          { name: 'Canceled', value: 'canceled' },
          { name: 'Expired', value: 'expired' },
        ],
        default: [],
        description: 'Notification types at the end of downtime',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: 'UTC',
        description: 'Timezone for the downtime (e.g., America/New_York)',
      },
      {
        displayName: 'Recurrence',
        name: 'recurrence',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: false,
        },
        default: {},
        options: [
          {
            displayName: 'Recurrence Settings',
            name: 'recurrenceValues',
            values: [
											{
												displayName: 'Period',
												name: 'period',
												type: 'number',
												default: 1,
												description: 'Number of periods between recurrences',
											},
											{
												displayName: 'Type',
												name: 'type',
												type: 'options',
												default: '',
												description: 'Type of recurrence',
											},
											{
												displayName: 'Until Date',
												name: 'until_date',
												type: 'dateTime',
												default: '',
												description: 'End date for the recurrence',
											},
											{
												displayName: 'Until Occurrences',
												name: 'until_occurrences',
												type: 'number',
												default: 0,
												description: 'Number of occurrences before ending (0 for no limit)',
											},
											{
												displayName: 'Week Days',
												name: 'week_days',
												type: 'multiOptions',
												options: [
													{
														name: 'Monday',
														value: 'Mon',
													},
													{
														name: 'Tuesday',
														value: 'Tue',
													},
													{
														name: 'Wednesday',
														value: 'Wed',
													},
													{
														name: 'Thursday',
														value: 'Thu',
													},
													{
														name: 'Friday',
														value: 'Fri',
													},
													{
														name: 'Saturday',
														value: 'Sat',
													},
													{
														name: 'Sunday',
														value: 'Sun',
													},
												],
												default: [],
												description: 'Days of the week for weekly recurrence',
											},
									],
          },
        ],
        description: 'Recurrence configuration for the downtime',
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
        resource: ['downtime'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Scope',
        name: 'scope',
        type: 'string',
        default: '',
        description: 'Comma-separated list of scope tags',
      },
      {
        displayName: 'Start Time',
        name: 'start',
        type: 'dateTime',
        default: '',
        description: 'Start time for the downtime',
      },
      {
        displayName: 'End Time',
        name: 'end',
        type: 'dateTime',
        default: '',
        description: 'End time for the downtime',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Message describing the downtime',
      },
      {
        displayName: 'Monitor ID',
        name: 'monitor_id',
        type: 'number',
        default: 0,
        description: 'Specific monitor ID to mute',
      },
      {
        displayName: 'Monitor Tags',
        name: 'monitor_tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of monitor tags',
      },
      {
        displayName: 'Mute First Recovery Notification',
        name: 'mute_first_recovery_notification',
        type: 'boolean',
        default: false,
        description: 'Whether to mute the first recovery notification',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: 'UTC',
        description: 'Timezone for the downtime',
      },
      {
        displayName: 'Recurrence',
        name: 'recurrence',
        type: 'json',
        default: '{}',
        description: 'Recurrence configuration as JSON',
      },
    ],
  },
];

export async function executeDowntimeOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const scope = this.getNodeParameter('scope', i) as string;
    const start = this.getNodeParameter('start', i, '') as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      scope: prepareTagsArray(scope),
    };

    if (start) {
      body.start = toUnixTimestamp(start);
    }

    if (additionalFields.end) {
      body.end = toUnixTimestamp(additionalFields.end);
    }
    if (additionalFields.message) {
      body.message = additionalFields.message;
    }
    if (additionalFields.monitor_id && additionalFields.monitor_id > 0) {
      body.monitor_id = additionalFields.monitor_id;
    }
    if (additionalFields.monitor_tags) {
      body.monitor_tags = prepareTagsArray(additionalFields.monitor_tags);
    }
    if (additionalFields.mute_first_recovery_notification !== undefined) {
      body.mute_first_recovery_notification = additionalFields.mute_first_recovery_notification;
    }
    if (additionalFields.notify_end_states && additionalFields.notify_end_states.length > 0) {
      body.notify_end_states = additionalFields.notify_end_states;
    }
    if (additionalFields.notify_end_types && additionalFields.notify_end_types.length > 0) {
      body.notify_end_types = additionalFields.notify_end_types;
    }
    if (additionalFields.timezone) {
      body.timezone = additionalFields.timezone;
    }

    // Handle recurrence
    if (additionalFields.recurrence?.recurrenceValues) {
      const recurrence = additionalFields.recurrence.recurrenceValues;
      body.recurrence = {
        type: recurrence.type,
        period: recurrence.period,
      };
      if (recurrence.week_days && recurrence.week_days.length > 0) {
        body.recurrence.week_days = recurrence.week_days;
      }
      if (recurrence.until_date) {
        body.recurrence.until_date = toUnixTimestamp(recurrence.until_date);
      }
      if (recurrence.until_occurrences && recurrence.until_occurrences > 0) {
        body.recurrence.until_occurrences = recurrence.until_occurrences;
      }
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/downtime', body);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.current_only !== undefined) {
      query.current_only = filters.current_only;
    }
    if (filters.with_creator !== undefined) {
      query.with_creator = filters.with_creator;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        '',
        'GET',
        '/downtime',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      responseData = await datadogApiRequest.call(this, 'GET', '/downtime', {}, query);
      responseData = (Array.isArray(responseData) ? responseData : []).slice(0, limit);
    }
  }

  if (operation === 'get') {
    const downtimeId = this.getNodeParameter('downtimeId', i) as number;
    responseData = await datadogApiRequest.call(this, 'GET', `/downtime/${downtimeId}`);
  }

  if (operation === 'update') {
    const downtimeId = this.getNodeParameter('downtimeId', i) as number;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    const body: Record<string, any> = {};

    if (updateFields.scope) {
      body.scope = prepareTagsArray(updateFields.scope);
    }
    if (updateFields.start) {
      body.start = toUnixTimestamp(updateFields.start);
    }
    if (updateFields.end) {
      body.end = toUnixTimestamp(updateFields.end);
    }
    if (updateFields.message !== undefined) {
      body.message = updateFields.message;
    }
    if (updateFields.monitor_id !== undefined) {
      body.monitor_id = updateFields.monitor_id;
    }
    if (updateFields.monitor_tags) {
      body.monitor_tags = prepareTagsArray(updateFields.monitor_tags);
    }
    if (updateFields.mute_first_recovery_notification !== undefined) {
      body.mute_first_recovery_notification = updateFields.mute_first_recovery_notification;
    }
    if (updateFields.timezone) {
      body.timezone = updateFields.timezone;
    }
    if (updateFields.recurrence) {
      body.recurrence = parseJsonParameter(updateFields.recurrence);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/downtime/${downtimeId}`, body);
  }

  if (operation === 'cancel') {
    const downtimeId = this.getNodeParameter('downtimeId', i) as number;
    await datadogApiRequest.call(this, 'DELETE', `/downtime/${downtimeId}`);
    responseData = { canceled: true, downtimeId };
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
