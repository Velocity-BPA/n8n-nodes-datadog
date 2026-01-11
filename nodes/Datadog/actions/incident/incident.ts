/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import {
  datadogApiRequest,
  datadogApiRequestWithCursor,
  parseJsonParameter,
} from '../../transport/requestHelper';
import { INCIDENT_SEVERITY_OPTIONS, INCIDENT_STATE_OPTIONS } from '../../constants/constants';

export const incidentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['incident'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new incident',
        action: 'Create an incident',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many incidents',
        action: 'Get many incidents',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific incident',
        action: 'Get an incident',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an incident',
        action: 'Update an incident',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an incident',
        action: 'Delete an incident',
      },
      {
        name: 'Add Attachment',
        value: 'addAttachment',
        description: 'Add an attachment to an incident',
        action: 'Add attachment to incident',
      },
      {
        name: 'Get Timeline',
        value: 'getTimeline',
        description: 'Get incident timeline',
        action: 'Get incident timeline',
      },
      {
        name: 'Add Timeline Cell',
        value: 'addTimelineCell',
        description: 'Add a timeline cell to an incident',
        action: 'Add timeline cell',
      },
      {
        name: 'Update Timeline Cell',
        value: 'updateTimelineCell',
        description: 'Update a timeline cell',
        action: 'Update timeline cell',
      },
      {
        name: 'Delete Timeline Cell',
        value: 'deleteTimelineCell',
        description: 'Delete a timeline cell',
        action: 'Delete timeline cell',
      },
    ],
    default: 'getAll',
  },
];

export const incidentFields: INodeProperties[] = [
  // Incident ID
  {
    displayName: 'Incident ID',
    name: 'incidentId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: [
          'get',
          'update',
          'delete',
          'addAttachment',
          'getTimeline',
          'addTimelineCell',
          'updateTimelineCell',
          'deleteTimelineCell',
        ],
      },
    },
    default: '',
    description: 'The ID of the incident',
  },

  // Timeline Cell ID
  {
    displayName: 'Timeline Cell ID',
    name: 'timelineCellId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['updateTimelineCell', 'deleteTimelineCell'],
      },
    },
    default: '',
    description: 'The ID of the timeline cell',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['incident'],
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
        resource: ['incident'],
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
        resource: ['incident'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'Filter incidents by search query',
      },
      {
        displayName: 'Include',
        name: 'include',
        type: 'multiOptions',
        options: [
          { name: 'Users', value: 'users' },
          { name: 'Attachments', value: 'attachments' },
        ],
        default: [],
        description: 'Additional data to include',
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
        resource: ['incident'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The title of the incident',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Customer Impact Scope',
        name: 'customer_impact_scope',
        type: 'string',
        default: '',
        description: 'Description of the customer impact scope',
      },
      {
        displayName: 'Customer Impacted',
        name: 'customer_impacted',
        type: 'boolean',
        default: false,
        description: 'Whether customers are impacted',
      },
      {
        displayName: 'Detected Time',
        name: 'detected',
        type: 'dateTime',
        default: '',
        description: 'When the incident was detected',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'json',
        default: '{}',
        description: 'Custom fields as JSON object',
      },
      {
        displayName: 'Notification Handles',
        name: 'notification_handles',
        type: 'string',
        default: '',
        description: 'Comma-separated notification handles',
      },
      {
        displayName: 'Severity',
        name: 'severity',
        type: 'options',
        options: INCIDENT_SEVERITY_OPTIONS,
        default: 'SEV-3',
        description: 'Severity of the incident',
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
        resource: ['incident'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'The title of the incident',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'options',
        options: INCIDENT_STATE_OPTIONS,
        default: 'active',
        description: 'The state of the incident',
      },
      {
        displayName: 'Severity',
        name: 'severity',
        type: 'options',
        options: INCIDENT_SEVERITY_OPTIONS,
        default: 'SEV-3',
        description: 'Severity of the incident',
      },
      {
        displayName: 'Customer Impact Scope',
        name: 'customer_impact_scope',
        type: 'string',
        default: '',
        description: 'Description of the customer impact scope',
      },
      {
        displayName: 'Customer Impacted',
        name: 'customer_impacted',
        type: 'boolean',
        default: false,
        description: 'Whether customers are impacted',
      },
      {
        displayName: 'Detected Time',
        name: 'detected',
        type: 'dateTime',
        default: '',
        description: 'When the incident was detected',
      },
      {
        displayName: 'Resolved Time',
        name: 'resolved',
        type: 'dateTime',
        default: '',
        description: 'When the incident was resolved',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'json',
        default: '{}',
        description: 'Custom fields as JSON object',
      },
    ],
  },

  // Attachment fields
  {
    displayName: 'Attachment Type',
    name: 'attachmentType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addAttachment'],
      },
    },
    options: [
      { name: 'Link', value: 'link' },
      { name: 'Postmortem', value: 'postmortem' },
    ],
    default: 'link',
    description: 'Type of attachment',
  },
  {
    displayName: 'Attachment URL',
    name: 'attachmentUrl',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addAttachment'],
      },
    },
    default: '',
    description: 'URL of the attachment',
  },
  {
    displayName: 'Display Text',
    name: 'displayText',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addAttachment'],
      },
    },
    default: '',
    description: 'Display text for the attachment link',
  },

  // Timeline Cell fields
  {
    displayName: 'Cell Type',
    name: 'cellType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addTimelineCell'],
      },
    },
    options: [
      { name: 'Markdown', value: 'markdown' },
      { name: 'Incident Field', value: 'incident_field' },
    ],
    default: 'markdown',
    description: 'Type of timeline cell',
  },
  {
    displayName: 'Content',
    name: 'cellContent',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addTimelineCell'],
        cellType: ['markdown'],
      },
    },
    default: '',
    description: 'Markdown content for the timeline cell',
  },
  {
    displayName: 'Important',
    name: 'cellImportant',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['addTimelineCell'],
      },
    },
    default: false,
    description: 'Whether this timeline cell is important',
  },

  // Update Timeline Cell fields
  {
    displayName: 'Update Fields',
    name: 'updateCellFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['incident'],
        operation: ['updateTimelineCell'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Markdown content for the timeline cell',
      },
      {
        displayName: 'Important',
        name: 'important',
        type: 'boolean',
        default: false,
        description: 'Whether this timeline cell is important',
      },
    ],
  },
];

export async function executeIncidentOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const title = this.getNodeParameter('title', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'incidents',
        attributes: {
          title,
        },
      },
    };

    if (additionalFields.customer_impact_scope) {
      body.data.attributes.customer_impact_scope = additionalFields.customer_impact_scope;
    }
    if (additionalFields.customer_impacted !== undefined) {
      body.data.attributes.customer_impacted = additionalFields.customer_impacted;
    }
    if (additionalFields.detected) {
      body.data.attributes.detected = new Date(additionalFields.detected).toISOString();
    }
    if (additionalFields.fields) {
      body.data.attributes.fields = parseJsonParameter(additionalFields.fields);
    }
    if (additionalFields.notification_handles) {
      body.data.attributes.notification_handles = additionalFields.notification_handles
        .split(',')
        .map((h: string) => ({ handle: h.trim() }));
    }
    if (additionalFields.severity) {
      body.data.attributes.fields = body.data.attributes.fields || {};
      body.data.attributes.fields.severity = { value: additionalFields.severity };
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/incidents', body, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.query) {
      query['filter[query]'] = filters.query;
    }
    if (filters.include && filters.include.length > 0) {
      query.include = filters.include.join(',');
    }

    if (returnAll) {
      responseData = await datadogApiRequestWithCursor.call(
        this,
        'data',
        'GET',
        '/incidents',
        {},
        query,
        'v2',
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query['page[size]'] = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/incidents', {}, query, 'v2');
      responseData = responseData.data?.slice(0, limit) || [];
    }
  }

  if (operation === 'get') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/incidents/${incidentId}`, {}, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'update') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'incidents',
        id: incidentId,
        attributes: {},
      },
    };

    if (updateFields.title) {
      body.data.attributes.title = updateFields.title;
    }
    if (updateFields.state) {
      body.data.attributes.fields = body.data.attributes.fields || {};
      body.data.attributes.fields.state = { value: updateFields.state };
    }
    if (updateFields.severity) {
      body.data.attributes.fields = body.data.attributes.fields || {};
      body.data.attributes.fields.severity = { value: updateFields.severity };
    }
    if (updateFields.customer_impact_scope) {
      body.data.attributes.customer_impact_scope = updateFields.customer_impact_scope;
    }
    if (updateFields.customer_impacted !== undefined) {
      body.data.attributes.customer_impacted = updateFields.customer_impacted;
    }
    if (updateFields.detected) {
      body.data.attributes.detected = new Date(updateFields.detected).toISOString();
    }
    if (updateFields.resolved) {
      body.data.attributes.resolved = new Date(updateFields.resolved).toISOString();
    }
    if (updateFields.fields) {
      const customFields = parseJsonParameter(updateFields.fields);
      body.data.attributes.fields = { ...body.data.attributes.fields, ...customFields };
    }

    responseData = await datadogApiRequest.call(
      this,
      'PATCH',
      `/incidents/${incidentId}`,
      body,
      {},
      'v2',
    );
    responseData = responseData.data;
  }

  if (operation === 'delete') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    await datadogApiRequest.call(this, 'DELETE', `/incidents/${incidentId}`, {}, {}, 'v2');
    responseData = { deleted: true, incidentId };
  }

  if (operation === 'addAttachment') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    const attachmentType = this.getNodeParameter('attachmentType', i) as string;
    const attachmentUrl = this.getNodeParameter('attachmentUrl', i) as string;
    const displayText = this.getNodeParameter('displayText', i, '') as string;

    const body: Record<string, any> = {
      data: [
        {
          type: 'incident_attachments',
          attributes: {
            attachment_type: attachmentType,
            attachment: {
              document_url: attachmentUrl,
              title: displayText || attachmentUrl,
            },
          },
        },
      ],
    };

    responseData = await datadogApiRequest.call(
      this,
      'POST',
      `/incidents/${incidentId}/attachments`,
      body,
      {},
      'v2',
    );
    responseData = responseData.data;
  }

  if (operation === 'getTimeline') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/incidents/${incidentId}/timeline`,
      {},
      {},
      'v2',
    );
    responseData = responseData.data;
  }

  if (operation === 'addTimelineCell') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    const cellType = this.getNodeParameter('cellType', i) as string;
    const cellImportant = this.getNodeParameter('cellImportant', i) as boolean;

    const body: Record<string, any> = {
      data: {
        type: 'incident_timeline_cells',
        attributes: {
          cell_type: cellType,
          important: cellImportant,
        },
      },
    };

    if (cellType === 'markdown') {
      const cellContent = this.getNodeParameter('cellContent', i) as string;
      body.data.attributes.content = {
        content: cellContent,
      };
    }

    responseData = await datadogApiRequest.call(
      this,
      'POST',
      `/incidents/${incidentId}/timeline`,
      body,
      {},
      'v2',
    );
    responseData = responseData.data;
  }

  if (operation === 'updateTimelineCell') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    const timelineCellId = this.getNodeParameter('timelineCellId', i) as string;
    const updateCellFields = this.getNodeParameter('updateCellFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'incident_timeline_cells',
        id: timelineCellId,
        attributes: {},
      },
    };

    if (updateCellFields.content) {
      body.data.attributes.content = {
        content: updateCellFields.content,
      };
    }
    if (updateCellFields.important !== undefined) {
      body.data.attributes.important = updateCellFields.important;
    }

    responseData = await datadogApiRequest.call(
      this,
      'PATCH',
      `/incidents/${incidentId}/timeline/${timelineCellId}`,
      body,
      {},
      'v2',
    );
    responseData = responseData.data;
  }

  if (operation === 'deleteTimelineCell') {
    const incidentId = this.getNodeParameter('incidentId', i) as string;
    const timelineCellId = this.getNodeParameter('timelineCellId', i) as string;
    await datadogApiRequest.call(
      this,
      'DELETE',
      `/incidents/${incidentId}/timeline/${timelineCellId}`,
      {},
      {},
      'v2',
    );
    responseData = { deleted: true, incidentId, timelineCellId };
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
