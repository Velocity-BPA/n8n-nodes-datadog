/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { datadogApiRequest } from '../../transport/requestHelper';

export const apmOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['apm'],
      },
    },
    options: [
      {
        name: 'Search Traces',
        value: 'searchTraces',
        description: 'Search for traces/spans',
        action: 'Search traces',
      },
      {
        name: 'Get Trace Services',
        value: 'getTraceServices',
        description: 'List all traced services',
        action: 'Get trace services',
      },
      {
        name: 'Get Service Summary',
        value: 'getServiceSummary',
        description: 'Get statistics for a service',
        action: 'Get service summary',
      },
      {
        name: 'Get Service Dependencies',
        value: 'getServiceDependencies',
        description: 'Get dependencies for a service',
        action: 'Get service dependencies',
      },
      {
        name: 'Get Resource Stats',
        value: 'getResourceStats',
        description: 'Get statistics for resources',
        action: 'Get resource stats',
      },
      {
        name: 'Get Span Tags',
        value: 'getSpanTags',
        description: 'Get span tags for filtering',
        action: 'Get span tags',
      },
    ],
    default: 'searchTraces',
  },
];

export const apmFields: INodeProperties[] = [
  // Search Traces
  {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['searchTraces'],
      },
    },
    default: '*',
    placeholder: 'service:my-service @http.status_code:500',
    description: 'Search query for traces',
  },
  {
    displayName: 'From',
    name: 'from',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['searchTraces', 'getServiceSummary', 'getResourceStats'],
      },
    },
    default: '',
    description: 'Start time for the query',
  },
  {
    displayName: 'To',
    name: 'to',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['searchTraces', 'getServiceSummary', 'getResourceStats'],
      },
    },
    default: '',
    description: 'End time for the query',
  },
  {
    displayName: 'Additional Options',
    name: 'traceOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['searchTraces'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Environment',
        name: 'env',
        type: 'string',
        default: '',
        description: 'Filter by environment',
      },
      {
        displayName: 'Service',
        name: 'service',
        type: 'string',
        default: '',
        description: 'Filter by service name',
      },
      {
        displayName: 'Operation Name',
        name: 'operation_name',
        type: 'string',
        default: '',
        description: 'Filter by operation name',
      },
      {
        displayName: 'Resource Name',
        name: 'resource_name',
        type: 'string',
        default: '',
        description: 'Filter by resource name',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 50,
        description: 'Max number of results to return',
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        options: [
          { name: 'Timestamp Ascending', value: 'timestamp' },
          { name: 'Timestamp Descending', value: '-timestamp' },
        ],
        default: '-timestamp',
        description: 'Sort order for results',
      },
    ],
  },

  // Get Trace Services
  {
    displayName: 'Environment',
    name: 'env',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getTraceServices', 'getServiceDependencies'],
      },
    },
    default: '',
    description: 'Environment to filter services (optional)',
  },

  // Get Service Summary / Dependencies
  {
    displayName: 'Service Name',
    name: 'serviceName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getServiceSummary', 'getServiceDependencies'],
      },
    },
    default: '',
    description: 'Name of the service',
  },
  {
    displayName: 'Environment',
    name: 'serviceEnv',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getServiceSummary'],
      },
    },
    default: '',
    description: 'Environment of the service',
  },

  // Get Resource Stats
  {
    displayName: 'Service Name',
    name: 'resourceService',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getResourceStats'],
      },
    },
    default: '',
    description: 'Service name for resource stats',
  },
  {
    displayName: 'Environment',
    name: 'resourceEnv',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getResourceStats'],
      },
    },
    default: '',
    description: 'Environment for resource stats',
  },
  {
    displayName: 'Resource Name',
    name: 'resourceName',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['apm'],
        operation: ['getResourceStats'],
      },
    },
    default: '',
    description: 'Specific resource name (optional)',
  },
];

export async function executeApmOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'searchTraces') {
    const query = this.getNodeParameter('query', i, '*') as string;
    const from = this.getNodeParameter('from', i) as string;
    const to = this.getNodeParameter('to', i) as string;
    const traceOptions = this.getNodeParameter('traceOptions', i, {}) as Record<string, any>;

    const body: Record<string, any> = {
      filter: {
        query,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      },
    };

    if (traceOptions.env) {
      body.filter.query = `env:${traceOptions.env} ${body.filter.query}`;
    }
    if (traceOptions.service) {
      body.filter.query = `service:${traceOptions.service} ${body.filter.query}`;
    }
    if (traceOptions.operation_name) {
      body.filter.query = `operation_name:${traceOptions.operation_name} ${body.filter.query}`;
    }
    if (traceOptions.resource_name) {
      body.filter.query = `resource_name:${traceOptions.resource_name} ${body.filter.query}`;
    }
    if (traceOptions.sort) {
      body.sort = traceOptions.sort;
    }
    if (traceOptions.limit) {
      body.page = { limit: traceOptions.limit };
    }

    responseData = await datadogApiRequest.call(
      this,
      'POST',
      '/spans/events/search',
      body,
      {},
      'v2',
    );
    responseData = responseData.data || [];
  }

  if (operation === 'getTraceServices') {
    const env = this.getNodeParameter('env', i, '') as string;
    const query: Record<string, any> = {};
    if (env) {
      query.env = env;
    }

    responseData = await datadogApiRequest.call(this, 'GET', '/services', {}, query);
    responseData = responseData.data || responseData;
  }

  if (operation === 'getServiceSummary') {
    const serviceName = this.getNodeParameter('serviceName', i) as string;
    const serviceEnv = this.getNodeParameter('serviceEnv', i) as string;
    const from = this.getNodeParameter('from', i) as string;
    const to = this.getNodeParameter('to', i) as string;

    const query: Record<string, any> = {
      env: serviceEnv,
      start: Math.floor(new Date(from).getTime() / 1000),
      end: Math.floor(new Date(to).getTime() / 1000),
    };

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/service_summary/${serviceName}`,
      {},
      query,
    );
  }

  if (operation === 'getServiceDependencies') {
    const serviceName = this.getNodeParameter('serviceName', i) as string;
    const env = this.getNodeParameter('env', i, '') as string;

    const query: Record<string, any> = {};
    if (env) {
      query.env = env;
    }

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/service_dependencies/${serviceName}`,
      {},
      query,
    );
  }

  if (operation === 'getResourceStats') {
    const serviceName = this.getNodeParameter('resourceService', i) as string;
    const env = this.getNodeParameter('resourceEnv', i) as string;
    const from = this.getNodeParameter('from', i) as string;
    const to = this.getNodeParameter('to', i) as string;
    const resourceName = this.getNodeParameter('resourceName', i, '') as string;

    const query: Record<string, any> = {
      env,
      start: Math.floor(new Date(from).getTime() / 1000),
      end: Math.floor(new Date(to).getTime() / 1000),
    };

    if (resourceName) {
      query.resource = resourceName;
    }

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/trace/resource/${serviceName}`,
      {},
      query,
    );
  }

  if (operation === 'getSpanTags') {
    responseData = await datadogApiRequest.call(
      this,
      'GET',
      '/spans/config/filters',
      {},
      {},
      'v2',
    );
    responseData = responseData.data || [];
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
