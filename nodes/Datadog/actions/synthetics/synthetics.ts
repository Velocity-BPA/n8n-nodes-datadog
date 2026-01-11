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
import { SYNTHETICS_TEST_TYPES, SYNTHETICS_TEST_STATUS, HTTP_METHODS } from '../../constants/constants';

export const syntheticsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
      },
    },
    options: [
      {
        name: 'Create Test',
        value: 'createTest',
        description: 'Create a synthetic test',
        action: 'Create synthetic test',
      },
      {
        name: 'Get All Tests',
        value: 'getAllTests',
        description: 'Get all synthetic tests',
        action: 'Get all synthetic tests',
      },
      {
        name: 'Get Test',
        value: 'getTest',
        description: 'Get a specific test',
        action: 'Get synthetic test',
      },
      {
        name: 'Update Test',
        value: 'updateTest',
        description: 'Update a synthetic test',
        action: 'Update synthetic test',
      },
      {
        name: 'Delete Test',
        value: 'deleteTest',
        description: 'Delete a synthetic test',
        action: 'Delete synthetic test',
      },
      {
        name: 'Trigger Test',
        value: 'triggerTest',
        description: 'Trigger a test run',
        action: 'Trigger test run',
      },
      {
        name: 'Get Test Results',
        value: 'getTestResults',
        action: 'Get test results',
      },
      {
        name: 'Get Global Variables',
        value: 'getGlobalVariables',
        description: 'List all global variables',
        action: 'Get global variables',
      },
      {
        name: 'Create Global Variable',
        value: 'createGlobalVariable',
        description: 'Create a global variable',
        action: 'Create global variable',
      },
      {
        name: 'Update Global Variable',
        value: 'updateGlobalVariable',
        description: 'Update a global variable',
        action: 'Update global variable',
      },
      {
        name: 'Delete Global Variable',
        value: 'deleteGlobalVariable',
        description: 'Delete a global variable',
        action: 'Delete global variable',
      },
      {
        name: 'Get Locations',
        value: 'getLocations',
        description: 'List all testing locations',
        action: 'Get testing locations',
      },
    ],
    default: 'getAllTests',
  },
];

export const syntheticsFields: INodeProperties[] = [
  // Test Public ID
  {
    displayName: 'Public ID',
    name: 'publicId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['getTest', 'updateTest', 'deleteTest', 'triggerTest', 'getTestResults'],
      },
    },
    default: '',
    description: 'The public ID of the test',
  },

  // Get All Tests
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['getAllTests'],
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
        resource: ['synthetics'],
        operation: ['getAllTests'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
  },

  // Create Test fields
  {
    displayName: 'Test Name',
    name: 'testName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
      },
    },
    default: '',
    description: 'Name of the synthetic test',
  },
  {
    displayName: 'Test Type',
    name: 'testType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
      },
    },
    options: SYNTHETICS_TEST_TYPES,
    default: 'api',
    description: 'Type of synthetic test',
  },
  {
    displayName: 'Locations',
    name: 'locations',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
      },
    },
    default: 'aws:us-east-1',
    placeholder: 'aws:us-east-1,aws:eu-west-1',
    description: 'Comma-separated list of testing locations',
  },

  // API Test Config
  {
    displayName: 'Request URL',
    name: 'requestUrl',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
        testType: ['api'],
      },
    },
    default: '',
    placeholder: 'https://api.example.com/health',
    description: 'URL to test',
  },
  {
    displayName: 'Request Method',
    name: 'requestMethod',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
        testType: ['api'],
      },
    },
    options: HTTP_METHODS,
    default: 'GET',
    description: 'HTTP method for the request',
  },
  {
    displayName: 'Additional Test Options',
    name: 'testOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createTest'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: SYNTHETICS_TEST_STATUS,
        default: 'live',
        description: 'Test status',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
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
        displayName: 'Tick Every (Seconds)',
        name: 'tick_every',
        type: 'number',
        default: 60,
        description: 'How often to run the test',
      },
      {
        displayName: 'Request Body',
        name: 'body',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Request body for POST/PUT requests',
      },
      {
        displayName: 'Request Headers',
        name: 'headers',
        type: 'json',
        default: '{}',
        description: 'Request headers as JSON',
      },
      {
        displayName: 'Assertions',
        name: 'assertions',
        type: 'json',
        default: '[{"type": "statusCode", "operator": "is", "target": 200}]',
        description: 'Test assertions as JSON array',
      },
      {
        displayName: 'Retry Count',
        name: 'retry_count',
        type: 'number',
        default: 0,
        description: 'Number of retries before failure',
      },
      {
        displayName: 'Retry Interval (Ms)',
        name: 'retry_interval',
        type: 'number',
        default: 300,
        description: 'Interval between retries in milliseconds',
      },
    ],
  },

  // Update Test fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['updateTest'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Test name',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: SYNTHETICS_TEST_STATUS,
        default: 'live',
        description: 'Test status',
      },
      {
        displayName: 'Locations',
        name: 'locations',
        type: 'string',
        default: '',
        description: 'Comma-separated list of locations',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
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
        displayName: 'Config',
        name: 'config',
        type: 'json',
        default: '{}',
        description: 'Test configuration as JSON',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'json',
        default: '{}',
        description: 'Test options as JSON',
      },
    ],
  },

  // Global Variable fields
  {
    displayName: 'Variable ID',
    name: 'variableId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['updateGlobalVariable', 'deleteGlobalVariable'],
      },
    },
    default: '',
    description: 'ID of the global variable',
  },
  {
    displayName: 'Variable Name',
    name: 'variableName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createGlobalVariable'],
      },
    },
    default: '',
    description: 'Name of the global variable',
  },
  {
    displayName: 'Variable Value',
    name: 'variableValue',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createGlobalVariable'],
      },
    },
    default: '',
    description: 'Value of the global variable',
  },
  {
    displayName: 'Variable Options',
    name: 'variableOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['createGlobalVariable', 'updateGlobalVariable'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Variable description',
      },
      {
        displayName: 'Secure',
        name: 'secure',
        type: 'boolean',
        default: false,
        description: 'Whether the variable is secure/hidden',
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tags',
      },
    ],
  },

  // Get Test Results options
  {
    displayName: 'Result Options',
    name: 'resultOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['synthetics'],
        operation: ['getTestResults'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'From',
        name: 'from_ts',
        type: 'dateTime',
        default: '',
        description: 'Start time for results',
      },
      {
        displayName: 'To',
        name: 'to_ts',
        type: 'dateTime',
        default: '',
        description: 'End time for results',
      },
    ],
  },
];

export async function executeSyntheticsOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'createTest') {
    const testName = this.getNodeParameter('testName', i) as string;
    const testType = this.getNodeParameter('testType', i) as string;
    const locations = this.getNodeParameter('locations', i) as string;
    const testOptions = this.getNodeParameter('testOptions', i, {}) as Record<string, any>;

    const body: Record<string, any> = {
      name: testName,
      type: testType,
      locations: prepareTagsArray(locations),
      config: {
        assertions: testOptions.assertions
          ? parseJsonParameter(testOptions.assertions)
          : [{ type: 'statusCode', operator: 'is', target: 200 }],
      },
      options: {
        tick_every: testOptions.tick_every || 60,
      },
    };

    if (testType === 'api') {
      const requestUrl = this.getNodeParameter('requestUrl', i) as string;
      const requestMethod = this.getNodeParameter('requestMethod', i, 'GET') as string;

      body.config.request = {
        method: requestMethod,
        url: requestUrl,
      };

      if (testOptions.body) {
        body.config.request.body = testOptions.body;
      }
      if (testOptions.headers) {
        body.config.request.headers = parseJsonParameter(testOptions.headers);
      }
    }

    if (testOptions.status) {
      body.status = testOptions.status;
    }
    if (testOptions.message) {
      body.message = testOptions.message;
    }
    if (testOptions.tags) {
      body.tags = prepareTagsArray(testOptions.tags);
    }
    if (testOptions.retry_count || testOptions.retry_interval) {
      body.options.retry = {
        count: testOptions.retry_count || 0,
        interval: testOptions.retry_interval || 300,
      };
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/synthetics/tests', body);
  }

  if (operation === 'getAllTests') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await datadogApiRequestAllItems.call(
        this,
        'tests',
        'GET',
        '/synthetics/tests',
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      responseData = await datadogApiRequest.call(this, 'GET', '/synthetics/tests');
      responseData = (responseData.tests || []).slice(0, limit);
    }
  }

  if (operation === 'getTest') {
    const publicId = this.getNodeParameter('publicId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/synthetics/tests/${publicId}`);
  }

  if (operation === 'updateTest') {
    const publicId = this.getNodeParameter('publicId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    // Get existing test
    const existingTest = await datadogApiRequest.call(
      this,
      'GET',
      `/synthetics/tests/${publicId}`,
    );

    const body: Record<string, any> = {
      name: updateFields.name || existingTest.name,
      type: existingTest.type,
      config: updateFields.config
        ? parseJsonParameter(updateFields.config)
        : existingTest.config,
      locations: updateFields.locations
        ? prepareTagsArray(updateFields.locations)
        : existingTest.locations,
      options: updateFields.options
        ? parseJsonParameter(updateFields.options)
        : existingTest.options,
    };

    if (updateFields.status) {
      body.status = updateFields.status;
    }
    if (updateFields.message) {
      body.message = updateFields.message;
    }
    if (updateFields.tags) {
      body.tags = prepareTagsArray(updateFields.tags);
    }

    responseData = await datadogApiRequest.call(
      this,
      'PUT',
      `/synthetics/tests/${publicId}`,
      body,
    );
  }

  if (operation === 'deleteTest') {
    const publicId = this.getNodeParameter('publicId', i) as string;
    const body = {
      public_ids: [publicId],
    };

    responseData = await datadogApiRequest.call(this, 'POST', '/synthetics/tests/delete', body);
  }

  if (operation === 'triggerTest') {
    const publicId = this.getNodeParameter('publicId', i) as string;
    const body = {
      tests: [{ public_id: publicId }],
    };

    responseData = await datadogApiRequest.call(this, 'POST', '/synthetics/tests/trigger', body);
  }

  if (operation === 'getTestResults') {
    const publicId = this.getNodeParameter('publicId', i) as string;
    const resultOptions = this.getNodeParameter('resultOptions', i, {}) as Record<string, any>;

    const query: Record<string, any> = {};
    if (resultOptions.from_ts) {
      query.from_ts = Math.floor(new Date(resultOptions.from_ts).getTime() / 1000);
    }
    if (resultOptions.to_ts) {
      query.to_ts = Math.floor(new Date(resultOptions.to_ts).getTime() / 1000);
    }

    responseData = await datadogApiRequest.call(
      this,
      'GET',
      `/synthetics/tests/${publicId}/results`,
      {},
      query,
    );
    responseData = responseData.results || [];
  }

  if (operation === 'getGlobalVariables') {
    responseData = await datadogApiRequest.call(this, 'GET', '/synthetics/variables');
    responseData = responseData.variables || [];
  }

  if (operation === 'createGlobalVariable') {
    const variableName = this.getNodeParameter('variableName', i) as string;
    const variableValue = this.getNodeParameter('variableValue', i) as string;
    const variableOptions = this.getNodeParameter('variableOptions', i, {}) as Record<string, any>;

    const body: Record<string, any> = {
      name: variableName,
      value: {
        value: variableValue,
        secure: variableOptions.secure || false,
      },
    };

    if (variableOptions.description) {
      body.description = variableOptions.description;
    }
    if (variableOptions.tags) {
      body.tags = prepareTagsArray(variableOptions.tags);
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/synthetics/variables', body);
  }

  if (operation === 'updateGlobalVariable') {
    const variableId = this.getNodeParameter('variableId', i) as string;
    const variableOptions = this.getNodeParameter('variableOptions', i, {}) as Record<string, any>;

    // Get existing variable
    const existingVar = await datadogApiRequest.call(
      this,
      'GET',
      `/synthetics/variables/${variableId}`,
    );

    const body: Record<string, any> = {
      name: existingVar.name,
      value: existingVar.value,
    };

    if (variableOptions.description !== undefined) {
      body.description = variableOptions.description;
    }
    if (variableOptions.secure !== undefined) {
      body.value.secure = variableOptions.secure;
    }
    if (variableOptions.tags) {
      body.tags = prepareTagsArray(variableOptions.tags);
    }

    responseData = await datadogApiRequest.call(
      this,
      'PUT',
      `/synthetics/variables/${variableId}`,
      body,
    );
  }

  if (operation === 'deleteGlobalVariable') {
    const variableId = this.getNodeParameter('variableId', i) as string;
    responseData = await datadogApiRequest.call(
      this,
      'DELETE',
      `/synthetics/variables/${variableId}`,
    );
    if (!responseData || Object.keys(responseData).length === 0) {
      responseData = { deleted_variable: variableId };
    }
  }

  if (operation === 'getLocations') {
    responseData = await datadogApiRequest.call(this, 'GET', '/synthetics/locations');
    responseData = responseData.locations || [];
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
