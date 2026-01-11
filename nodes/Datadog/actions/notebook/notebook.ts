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
} from '../../transport/requestHelper';

export const notebookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['notebook'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new notebook',
        action: 'Create a notebook',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many notebooks',
        action: 'Get many notebooks',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific notebook',
        action: 'Get a notebook',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a notebook',
        action: 'Update a notebook',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a notebook',
        action: 'Delete a notebook',
      },
    ],
    default: 'getAll',
  },
];

export const notebookFields: INodeProperties[] = [
  // Notebook ID
  {
    displayName: 'Notebook ID',
    name: 'notebookId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['notebook'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    description: 'The ID of the notebook',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['notebook'],
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
        resource: ['notebook'],
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
        resource: ['notebook'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Author Handle',
        name: 'author_handle',
        type: 'string',
        default: '',
        description: 'Filter notebooks by author handle',
      },
      {
        displayName: 'Exclude Author Handle',
        name: 'exclude_author_handle',
        type: 'string',
        default: '',
        description: 'Exclude notebooks by author handle',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'Filter notebooks by search query',
      },
      {
        displayName: 'Include Cells',
        name: 'include_cells',
        type: 'boolean',
        default: false,
        description: 'Whether to include the cell contents',
      },
      {
        displayName: 'Is Template',
        name: 'is_template',
        type: 'boolean',
        default: false,
        description: 'Whether to filter by template status',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Investigation', value: 'investigation' },
          { name: 'Postmortem', value: 'postmortem' },
          { name: 'Runbook', value: 'runbook' },
        ],
        default: 'investigation',
        description: 'Filter by notebook type',
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
        resource: ['notebook'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the notebook',
  },
  {
    displayName: 'Cells',
    name: 'cells',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['notebook'],
        operation: ['create'],
      },
    },
    default: '[\n  {\n    "attributes": {\n      "definition": {\n        "type": "markdown",\n        "text": "# My Notebook\\n\\nThis is a markdown cell."\n      }\n    },\n    "type": "notebook_cells"\n  }\n]',
    description: 'Array of notebook cells (markdown, timeseries, query)',
  },
  {
    displayName: 'Time',
    name: 'time',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['notebook'],
        operation: ['create'],
      },
    },
    default: '{\n  "live_span": "1h"\n}',
    description: 'Time range for the notebook (e.g., {"live_span": "1h"} or {"start": 1609459200000, "end": 1609545600000})',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['notebook'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Published', value: 'published' },
          { name: 'Draft', value: 'draft' },
        ],
        default: 'draft',
        description: 'The status of the notebook',
      },
      {
        displayName: 'Metadata',
        name: 'metadata',
        type: 'json',
        default: '{}',
        description: 'Notebook metadata as JSON',
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
        resource: ['notebook'],
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
        description: 'The name of the notebook',
      },
      {
        displayName: 'Cells',
        name: 'cells',
        type: 'json',
        default: '[]',
        description: 'Array of notebook cells',
      },
      {
        displayName: 'Time',
        name: 'time',
        type: 'json',
        default: '{}',
        description: 'Time range for the notebook',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Published', value: 'published' },
          { name: 'Draft', value: 'draft' },
        ],
        default: 'draft',
        description: 'The status of the notebook',
      },
      {
        displayName: 'Metadata',
        name: 'metadata',
        type: 'json',
        default: '{}',
        description: 'Notebook metadata as JSON',
      },
    ],
  },
];

export async function executeNotebookOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const name = this.getNodeParameter('name', i) as string;
    const cells = this.getNodeParameter('cells', i) as string;
    const time = this.getNodeParameter('time', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'notebooks',
        attributes: {
          name,
          cells: parseJsonParameter(cells),
          time: parseJsonParameter(time),
        },
      },
    };

    if (additionalFields.status) {
      body.data.attributes.status = additionalFields.status;
    }
    if (additionalFields.metadata) {
      body.data.attributes.metadata = parseJsonParameter(additionalFields.metadata);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/notebooks', body);
    responseData = responseData.data;
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.author_handle) {
      query.author_handle = filters.author_handle;
    }
    if (filters.exclude_author_handle) {
      query.exclude_author_handle = filters.exclude_author_handle;
    }
    if (filters.query) {
      query.query = filters.query;
    }
    if (filters.include_cells !== undefined) {
      query.include_cells = filters.include_cells;
    }
    if (filters.is_template !== undefined) {
      query.is_template = filters.is_template;
    }
    if (filters.type) {
      query.type = filters.type;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'data',
        'GET',
        '/notebooks',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.count = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/notebooks', {}, query);
      responseData = responseData.data?.slice(0, limit) || [];
    }
  }

  if (operation === 'get') {
    const notebookId = this.getNodeParameter('notebookId', i) as number;
    responseData = await datadogApiRequest.call(this, 'GET', `/notebooks/${notebookId}`);
    responseData = responseData.data;
  }

  if (operation === 'update') {
    const notebookId = this.getNodeParameter('notebookId', i) as number;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    // First get the existing notebook to preserve required fields
    const existingNotebook = await datadogApiRequest.call(this, 'GET', `/notebooks/${notebookId}`);
    const existing = existingNotebook.data.attributes;

    const body: Record<string, any> = {
      data: {
        type: 'notebooks',
        attributes: {
          name: updateFields.name || existing.name,
          cells: updateFields.cells ? parseJsonParameter(updateFields.cells) : existing.cells,
          time: updateFields.time ? parseJsonParameter(updateFields.time) : existing.time,
        },
      },
    };

    if (updateFields.status) {
      body.data.attributes.status = updateFields.status;
    }
    if (updateFields.metadata) {
      body.data.attributes.metadata = parseJsonParameter(updateFields.metadata);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/notebooks/${notebookId}`, body);
    responseData = responseData.data;
  }

  if (operation === 'delete') {
    const notebookId = this.getNodeParameter('notebookId', i) as number;
    await datadogApiRequest.call(this, 'DELETE', `/notebooks/${notebookId}`);
    responseData = { deleted: true, notebookId };
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
