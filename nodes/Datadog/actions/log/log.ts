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

export const logOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['log'],
      },
    },
    options: [
      {
        name: 'Submit',
        value: 'submit',
        description: 'Submit log entries',
        action: 'Submit logs',
      },
      {
        name: 'Search',
        value: 'search',
        description: 'Search logs',
        action: 'Search logs',
      },
      {
        name: 'Aggregate',
        value: 'aggregate',
        description: 'Aggregate log data',
        action: 'Aggregate logs',
      },
      {
        name: 'Get Indexes',
        value: 'getIndexes',
        description: 'List all log indexes',
        action: 'Get log indexes',
      },
      {
        name: 'Create Index',
        value: 'createIndex',
        description: 'Create a log index',
        action: 'Create log index',
      },
      {
        name: 'Update Index',
        value: 'updateIndex',
        description: 'Update a log index',
        action: 'Update log index',
      },
      {
        name: 'Delete Index',
        value: 'deleteIndex',
        description: 'Delete a log index',
        action: 'Delete log index',
      },
      {
        name: 'Get Pipelines',
        value: 'getPipelines',
        description: 'List all log pipelines',
        action: 'Get log pipelines',
      },
      {
        name: 'Create Pipeline',
        value: 'createPipeline',
        description: 'Create a log pipeline',
        action: 'Create log pipeline',
      },
      {
        name: 'Update Pipeline',
        value: 'updatePipeline',
        description: 'Update a log pipeline',
        action: 'Update log pipeline',
      },
      {
        name: 'Delete Pipeline',
        value: 'deletePipeline',
        description: 'Delete a log pipeline',
        action: 'Delete log pipeline',
      },
    ],
    default: 'search',
  },
];

export const logFields: INodeProperties[] = [
  // Submit logs
  {
    displayName: 'Logs',
    name: 'logs',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['submit'],
      },
    },
    default: '[\n  {\n    "message": "Log message",\n    "ddsource": "my-source",\n    "ddtags": "env:production",\n    "hostname": "myhost",\n    "service": "my-service"\n  }\n]',
    description: 'Array of log entries to submit',
  },

  // Search logs
  {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['search'],
      },
    },
    default: '*',
    placeholder: 'service:my-service status:error',
    description: 'Log search query',
  },
  {
    displayName: 'From',
    name: 'from',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['search'],
      },
    },
    default: '',
    description: 'Start time for the search',
  },
  {
    displayName: 'To',
    name: 'to',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['search'],
      },
    },
    default: '',
    description: 'End time for the search',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['search'],
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
        resource: ['log'],
        operation: ['search'],
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
    displayName: 'Additional Options',
    name: 'searchOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['search'],
      },
    },
    default: {},
    options: [
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
      {
        displayName: 'Index',
        name: 'index',
        type: 'string',
        default: '',
        description: 'Index to search in',
      },
    ],
  },

  // Aggregate logs
  {
    displayName: 'Aggregation Query',
    name: 'aggregationQuery',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['aggregate'],
      },
    },
    default: '{\n  "filter": {\n    "query": "*",\n    "from": "now-1h",\n    "to": "now"\n  },\n  "compute": [\n    {\n      "aggregation": "count"\n    }\n  ]\n}',
    description: 'Aggregation query configuration',
  },

  // Index operations
  {
    displayName: 'Index Name',
    name: 'indexName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['createIndex', 'updateIndex', 'deleteIndex'],
      },
    },
    default: '',
    description: 'Name of the log index',
  },

  // Create/Update Index
  {
    displayName: 'Index Configuration',
    name: 'indexConfig',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['createIndex', 'updateIndex'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Filter Query',
        name: 'filter_query',
        type: 'string',
        default: '*',
        description: 'Filter query for the index',
      },
      {
        displayName: 'Retention Days',
        name: 'retention_days',
        type: 'number',
        default: 15,
        description: 'Number of days to retain logs',
      },
      {
        displayName: 'Daily Limit',
        name: 'daily_limit',
        type: 'number',
        default: 0,
        description: 'Daily limit for log ingestion (0 = no limit)',
      },
      {
        displayName: 'Exclusion Filters',
        name: 'exclusion_filters',
        type: 'json',
        default: '[]',
        description: 'Array of exclusion filter configurations',
      },
    ],
  },

  // Pipeline operations
  {
    displayName: 'Pipeline ID',
    name: 'pipelineId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['updatePipeline', 'deletePipeline'],
      },
    },
    default: '',
    description: 'ID of the log pipeline',
  },

  // Create/Update Pipeline
  {
    displayName: 'Pipeline Name',
    name: 'pipelineName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['createPipeline'],
      },
    },
    default: '',
    description: 'Name of the log pipeline',
  },
  {
    displayName: 'Pipeline Configuration',
    name: 'pipelineConfig',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['log'],
        operation: ['createPipeline', 'updatePipeline'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Is Enabled',
        name: 'is_enabled',
        type: 'boolean',
        default: true,
        description: 'Whether the pipeline is enabled',
      },
      {
        displayName: 'Filter Query',
        name: 'filter_query',
        type: 'string',
        default: '*',
        description: 'Filter query for the pipeline',
      },
      {
        displayName: 'Processors',
        name: 'processors',
        type: 'json',
        default: '[]',
        description: 'Array of processor configurations',
      },
    ],
  },
];

export async function executeLogOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'submit') {
    const logs = this.getNodeParameter('logs', i) as string;
    const body = parseJsonParameter(logs);

    responseData = await datadogApiRequest.call(this, 'POST', '/logs', body, {}, 'v2');
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { status: 'ok', message: 'Logs submitted successfully' };
    }
  }

  if (operation === 'search') {
    const query = this.getNodeParameter('query', i) as string;
    const from = this.getNodeParameter('from', i) as string;
    const to = this.getNodeParameter('to', i) as string;
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const searchOptions = this.getNodeParameter('searchOptions', i, {}) as Record<string, any>;

    const body: Record<string, any> = {
      filter: {
        query,
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      },
      sort: searchOptions.sort || '-timestamp',
    };

    if (searchOptions.index) {
      body.filter.indexes = [searchOptions.index];
    }

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'data',
        'POST',
        '/logs/events/search',
        body,
        {},
        'v2',
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      body.page = { limit };
      responseData = await datadogApiRequest.call(
        this,
        'POST',
        '/logs/events/search',
        body,
        {},
        'v2',
      );
      responseData = responseData.data || [];
    }
  }

  if (operation === 'aggregate') {
    const aggregationQuery = this.getNodeParameter('aggregationQuery', i) as string;
    const body = parseJsonParameter(aggregationQuery);

    responseData = await datadogApiRequest.call(
      this,
      'POST',
      '/logs/analytics/aggregate',
      body,
      {},
      'v2',
    );
  }

  if (operation === 'getIndexes') {
    responseData = await datadogApiRequest.call(this, 'GET', '/logs/config/indexes');
    responseData = responseData.indexes || [];
  }

  if (operation === 'createIndex') {
    const indexName = this.getNodeParameter('indexName', i) as string;
    const indexConfig = this.getNodeParameter('indexConfig', i) as Record<string, any>;

    const body: Record<string, any> = {
      name: indexName,
      filter: {
        query: indexConfig.filter_query || '*',
      },
    };

    if (indexConfig.retention_days) {
      body.retention_days = indexConfig.retention_days;
    }
    if (indexConfig.daily_limit) {
      body.daily_limit = indexConfig.daily_limit;
    }
    if (indexConfig.exclusion_filters) {
      body.exclusion_filters = parseJsonParameter(indexConfig.exclusion_filters);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/logs/config/indexes', body);
  }

  if (operation === 'updateIndex') {
    const indexName = this.getNodeParameter('indexName', i) as string;
    const indexConfig = this.getNodeParameter('indexConfig', i) as Record<string, any>;

    const body: Record<string, any> = {};

    if (indexConfig.filter_query) {
      body.filter = { query: indexConfig.filter_query };
    }
    if (indexConfig.retention_days) {
      body.retention_days = indexConfig.retention_days;
    }
    if (indexConfig.daily_limit !== undefined) {
      body.daily_limit = indexConfig.daily_limit;
    }
    if (indexConfig.exclusion_filters) {
      body.exclusion_filters = parseJsonParameter(indexConfig.exclusion_filters);
    }

    responseData = await datadogApiRequest.call(
      this,
      'PUT',
      `/logs/config/indexes/${indexName}`,
      body,
    );
  }

  if (operation === 'deleteIndex') {
    const indexName = this.getNodeParameter('indexName', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/logs/config/indexes/${indexName}`,
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_index: indexName };
    }
  }

  if (operation === 'getPipelines') {
    responseData = await datadogApiRequest.call(this, 'GET', '/logs/config/pipelines');
    if (!Array.isArray(responseData)) {
      responseData = responseData.pipelines || [];
    }
  }

  if (operation === 'createPipeline') {
    const pipelineName = this.getNodeParameter('pipelineName', i) as string;
    const pipelineConfig = this.getNodeParameter('pipelineConfig', i) as Record<string, any>;

    const body: Record<string, any> = {
      name: pipelineName,
      is_enabled: pipelineConfig.is_enabled !== false,
      filter: {
        query: pipelineConfig.filter_query || '*',
      },
      processors: pipelineConfig.processors
        ? parseJsonParameter(pipelineConfig.processors)
        : [],
    };

    responseData = await datadogApiRequest.call(this, 'POST', '/logs/config/pipelines', body);
  }

  if (operation === 'updatePipeline') {
    const pipelineId = this.getNodeParameter('pipelineId', i) as string;
    const pipelineConfig = this.getNodeParameter('pipelineConfig', i) as Record<string, any>;

    // Get existing pipeline to merge updates
    const existingPipeline = await datadogApiRequest.call(
      this,
      'GET',
      `/logs/config/pipelines/${pipelineId}`,
    );

    const body: Record<string, any> = {
      name: existingPipeline.name,
      is_enabled: pipelineConfig.is_enabled !== undefined
        ? pipelineConfig.is_enabled
        : existingPipeline.is_enabled,
      filter: pipelineConfig.filter_query
        ? { query: pipelineConfig.filter_query }
        : existingPipeline.filter,
      processors: pipelineConfig.processors
        ? parseJsonParameter(pipelineConfig.processors)
        : existingPipeline.processors,
    };

    responseData = await datadogApiRequest.call(
      this,
      'PUT',
      `/logs/config/pipelines/${pipelineId}`,
      body,
    );
  }

  if (operation === 'deletePipeline') {
    const pipelineId = this.getNodeParameter('pipelineId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/logs/config/pipelines/${pipelineId}`,
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_pipeline: pipelineId };
    }
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
