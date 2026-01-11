/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

// Import operations and fields from all resources
import { metricOperations, metricFields, executeMetricOperation } from './actions/metric/metric';
import { monitorOperations, monitorFields, executeMonitorOperation } from './actions/monitor/monitor';
import { dashboardOperations, dashboardFields, executeDashboardOperation } from './actions/dashboard/dashboard';
import { eventOperations, eventFields, executeEventOperation } from './actions/event/event';
import { logOperations, logFields, executeLogOperation } from './actions/log/log';
import { apmOperations, apmFields, executeApmOperation } from './actions/apm/apm';
import { syntheticsOperations, syntheticsFields, executeSyntheticsOperation } from './actions/synthetics/synthetics';
import { incidentOperations, incidentFields, executeIncidentOperation } from './actions/incident/incident';
import { sloOperations, sloFields, executeSloOperation } from './actions/slo/slo';
import { notebookOperations, notebookFields, executeNotebookOperation } from './actions/notebook/notebook';
import { downtimeOperations, downtimeFields, executeDowntimeOperation } from './actions/downtime/downtime';
import { userOperations, userFields, executeUserOperation } from './actions/user/user';

export class Datadog implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Datadog',
    name: 'datadog',
    icon: 'file:datadog.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Consume Datadog API for monitoring, metrics, incidents, and observability',
    defaults: {
      name: 'Datadog',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'datadogApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'APM',
            value: 'apm',
            description: 'Search and analyze application traces',
          },
          {
            name: 'Dashboard',
            value: 'dashboard',
            description: 'Create and manage dashboards',
          },
          {
            name: 'Downtime',
            value: 'downtime',
            description: 'Schedule and manage downtimes',
          },
          {
            name: 'Event',
            value: 'event',
            description: 'Create and query events',
          },
          {
            name: 'Incident',
            value: 'incident',
            description: 'Manage incidents and timeline',
          },
          {
            name: 'Log',
            value: 'log',
            description: 'Submit and search logs',
          },
          {
            name: 'Metric',
            value: 'metric',
            description: 'Query and submit metrics',
          },
          {
            name: 'Monitor',
            value: 'monitor',
            description: 'Create and manage monitors',
          },
          {
            name: 'Notebook',
            value: 'notebook',
            description: 'Create and manage notebooks',
          },
          {
            name: 'SLO',
            value: 'slo',
            description: 'Manage Service Level Objectives',
          },
          {
            name: 'Synthetic',
            value: 'synthetics',
            description: 'Manage synthetic tests',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Manage users, roles, and organization',
          },
        ],
        default: 'metric',
      },

      // Include all operations
      ...metricOperations,
      ...monitorOperations,
      ...dashboardOperations,
      ...eventOperations,
      ...logOperations,
      ...apmOperations,
      ...syntheticsOperations,
      ...incidentOperations,
      ...sloOperations,
      ...notebookOperations,
      ...downtimeOperations,
      ...userOperations,

      // Include all fields
      ...metricFields,
      ...monitorFields,
      ...dashboardFields,
      ...eventFields,
      ...logFields,
      ...apmFields,
      ...syntheticsFields,
      ...incidentFields,
      ...sloFields,
      ...notebookFields,
      ...downtimeFields,
      ...userFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let executionData: INodeExecutionData[];

        switch (resource) {
          case 'metric':
            executionData = await executeMetricOperation.call(this, operation, i);
            break;
          case 'monitor':
            executionData = await executeMonitorOperation.call(this, operation, i);
            break;
          case 'dashboard':
            executionData = await executeDashboardOperation.call(this, operation, i);
            break;
          case 'event':
            executionData = await executeEventOperation.call(this, operation, i);
            break;
          case 'log':
            executionData = await executeLogOperation.call(this, operation, i);
            break;
          case 'apm':
            executionData = await executeApmOperation.call(this, operation, i);
            break;
          case 'synthetics':
            executionData = await executeSyntheticsOperation.call(this, operation, i);
            break;
          case 'incident':
            executionData = await executeIncidentOperation.call(this, operation, i);
            break;
          case 'slo':
            executionData = await executeSloOperation.call(this, operation, i);
            break;
          case 'notebook':
            executionData = await executeNotebookOperation.call(this, operation, i);
            break;
          case 'downtime':
            executionData = await executeDowntimeOperation.call(this, operation, i);
            break;
          case 'user':
            executionData = await executeUserOperation.call(this, operation, i);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
