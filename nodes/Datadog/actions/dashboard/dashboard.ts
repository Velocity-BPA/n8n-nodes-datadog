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
import { DASHBOARD_LAYOUT_TYPES } from '../../constants/constants';

export const dashboardOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['dashboard'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new dashboard',
        action: 'Create a dashboard',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many dashboards',
        action: 'Get many dashboards',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific dashboard',
        action: 'Get a dashboard',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a dashboard',
        action: 'Update a dashboard',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a dashboard',
        action: 'Delete a dashboard',
      },
      {
        name: 'Get Public URL',
        value: 'getPublicUrl',
        description: 'Get public URL for a dashboard',
        action: 'Get public URL',
      },
      {
        name: 'Delete Public URL',
        value: 'deletePublicUrl',
        description: 'Delete public URL for a dashboard',
        action: 'Delete public URL',
      },
      {
        name: 'Restore',
        value: 'restore',
        description: 'Restore a deleted dashboard',
        action: 'Restore a dashboard',
      },
    ],
    default: 'getAll',
  },
];

export const dashboardFields: INodeProperties[] = [
  // Dashboard ID
  {
    displayName: 'Dashboard ID',
    name: 'dashboardId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['dashboard'],
        operation: ['get', 'update', 'delete', 'getPublicUrl', 'deletePublicUrl', 'restore'],
      },
    },
    default: '',
    description: 'The ID of the dashboard',
  },

  // Get All options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['dashboard'],
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
        resource: ['dashboard'],
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
        resource: ['dashboard'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Filter by Shared',
        name: 'filter_shared',
        type: 'boolean',
        default: false,
        description: 'Whether to filter dashboards by shared status',
      },
      {
        displayName: 'Filter Deleted',
        name: 'filter_deleted',
        type: 'boolean',
        default: false,
        description: 'Whether to include deleted dashboards',
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
        resource: ['dashboard'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The title of the dashboard',
  },
  {
    displayName: 'Layout Type',
    name: 'layoutType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['dashboard'],
        operation: ['create'],
      },
    },
    options: DASHBOARD_LAYOUT_TYPES,
    default: 'ordered',
    description: 'The layout type of the dashboard',
  },
  {
    displayName: 'Widgets',
    name: 'widgets',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['dashboard'],
        operation: ['create'],
      },
    },
    default: '[\n  {\n    "definition": {\n      "type": "timeseries",\n      "requests": [\n        {\n          "q": "avg:system.cpu.user{*}",\n          "display_type": "line"\n        }\n      ],\n      "title": "CPU Usage"\n    }\n  }\n]',
    description: 'Array of widget configurations',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['dashboard'],
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
        description: 'Description of the dashboard',
      },
      {
        displayName: 'Is Read Only',
        name: 'is_read_only',
        type: 'boolean',
        default: false,
        description: 'Whether the dashboard is read-only',
      },
      {
        displayName: 'Notify List',
        name: 'notify_list',
        type: 'string',
        default: '',
        description: 'Comma-separated list of handles to notify',
      },
      {
        displayName: 'Reflow Type',
        name: 'reflow_type',
        type: 'options',
        options: [
          { name: 'Auto', value: 'auto' },
          { name: 'Fixed', value: 'fixed' },
        ],
        default: 'auto',
        description: 'Reflow type for the dashboard',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Template Variables',
        name: 'template_variables',
        type: 'json',
        default: '[]',
        description: 'Array of template variable definitions',
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
        resource: ['dashboard'],
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
        description: 'The title of the dashboard',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the dashboard',
      },
      {
        displayName: 'Layout Type',
        name: 'layout_type',
        type: 'options',
        options: DASHBOARD_LAYOUT_TYPES,
        default: 'ordered',
        description: 'The layout type of the dashboard',
      },
      {
        displayName: 'Widgets',
        name: 'widgets',
        type: 'json',
        default: '[]',
        description: 'Array of widget configurations',
      },
      {
        displayName: 'Is Read Only',
        name: 'is_read_only',
        type: 'boolean',
        default: false,
        description: 'Whether the dashboard is read-only',
      },
      {
        displayName: 'Notify List',
        name: 'notify_list',
        type: 'string',
        default: '',
        description: 'Comma-separated list of handles to notify',
      },
      {
        displayName: 'Reflow Type',
        name: 'reflow_type',
        type: 'options',
        options: [
          { name: 'Auto', value: 'auto' },
          { name: 'Fixed', value: 'fixed' },
        ],
        default: 'auto',
        description: 'Reflow type for the dashboard',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
      {
        displayName: 'Template Variables',
        name: 'template_variables',
        type: 'json',
        default: '[]',
        description: 'Array of template variable definitions',
      },
    ],
  },
];

export async function executeDashboardOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'create') {
    const title = this.getNodeParameter('title', i) as string;
    const layoutType = this.getNodeParameter('layoutType', i) as string;
    const widgets = this.getNodeParameter('widgets', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      title,
      layout_type: layoutType,
      widgets: parseJsonParameter(widgets),
    };

    if (additionalFields.description) {
      body.description = additionalFields.description;
    }
    if (additionalFields.is_read_only !== undefined) {
      body.is_read_only = additionalFields.is_read_only;
    }
    if (additionalFields.notify_list) {
      body.notify_list = prepareTagsArray(additionalFields.notify_list);
    }
    if (additionalFields.reflow_type) {
      body.reflow_type = additionalFields.reflow_type;
    }
    if (additionalFields.tags) {
      body.tags = prepareTagsArray(additionalFields.tags);
    }
    if (additionalFields.template_variables) {
      body.template_variables = parseJsonParameter(additionalFields.template_variables);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/dashboard', body);
  }

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.filter_shared !== undefined) {
      query.filter_shared = filters.filter_shared;
    }
    if (filters.filter_deleted !== undefined) {
      query.filter_deleted = filters.filter_deleted;
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'dashboards',
        'GET',
        '/dashboard',
        {},
        query,
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query.count = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/dashboard', {}, query);
      responseData = responseData.dashboards?.slice(0, limit) || [];
    }
  }

  if (operation === 'get') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/dashboard/${dashboardId}`);
  }

  if (operation === 'update') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    // First get the existing dashboard to preserve required fields
    const existingDashboard = await datadogApiRequest.call(
      this,
      'GET',
      `/dashboard/${dashboardId}`,
    );

    const body: Record<string, any> = {
      title: updateFields.title || existingDashboard.title,
      layout_type: updateFields.layout_type || existingDashboard.layout_type,
      widgets: updateFields.widgets
        ? parseJsonParameter(updateFields.widgets)
        : existingDashboard.widgets,
    };

    if (updateFields.description !== undefined) {
      body.description = updateFields.description;
    }
    if (updateFields.is_read_only !== undefined) {
      body.is_read_only = updateFields.is_read_only;
    }
    if (updateFields.notify_list) {
      body.notify_list = prepareTagsArray(updateFields.notify_list);
    }
    if (updateFields.reflow_type) {
      body.reflow_type = updateFields.reflow_type;
    }
    if (updateFields.tags) {
      body.tags = prepareTagsArray(updateFields.tags);
    }
    if (updateFields.template_variables) {
      body.template_variables = parseJsonParameter(updateFields.template_variables);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/dashboard/${dashboardId}`, body);
  }

  if (operation === 'delete') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    responseData = await datadogApiRequest.call(this, 'DELETE', `/dashboard/${dashboardId}`);
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_dashboard_id: dashboardId };
    }
  }

  if (operation === 'getPublicUrl') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/dashboard/public/${dashboardId}`);
  }

  if (operation === 'deletePublicUrl') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/dashboard/public/${dashboardId}`,
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_public_url: dashboardId };
    }
  }

  if (operation === 'restore') {
    const dashboardId = this.getNodeParameter('dashboardId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'PATCH',
      `/dashboard/${dashboardId}`,
      { deleted: false },
    );
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
