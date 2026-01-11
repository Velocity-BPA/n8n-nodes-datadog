/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

export class DatadogTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Datadog Trigger',
    name: 'datadogTrigger',
    icon: 'file:datadog.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"].join(", ")}}',
    description: 'Listen for Datadog webhook notifications from monitors and alerts',
    defaults: {
      name: 'Datadog Trigger',
    },
    inputs: [],
    outputs: ['main'],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          {
            name: 'Monitor Alert',
            value: 'alert',
            description: 'When a monitor triggers an alert',
          },
          {
            name: 'Monitor No Data',
            value: 'no_data',
            description: 'When a monitor enters no-data state',
          },
          {
            name: 'Monitor Recovery',
            value: 'recovery',
            description: 'When a monitor recovers',
          },
          {
            name: 'Monitor Renotify',
            value: 'renotify',
            description: 'When a monitor renotifies',
          },
          {
            name: 'Monitor Warning',
            value: 'warn',
            description: 'When a monitor triggers a warning',
          },
        ],
        default: ['alert', 'recovery'],
        description: 'The events to listen to',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Filter by Monitor Tags',
            name: 'filterTags',
            type: 'string',
            default: '',
            description: 'Comma-separated list of tags to filter incoming webhooks (e.g., env:prod,service:api)',
          },
          {
            displayName: 'Filter by Priority',
            name: 'filterPriority',
            type: 'multiOptions',
            options: [
              { name: 'P1 (Critical)', value: 'P1' },
              { name: 'P2 (High)', value: 'P2' },
              { name: 'P3 (Medium)', value: 'P3' },
              { name: 'P4 (Low)', value: 'P4' },
              { name: 'P5 (Informational)', value: 'P5' },
            ],
            default: [],
            description: 'Only process webhooks with these priority levels',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Webhooks are configured on Datadog side, so we just return true
        // to indicate the webhook is ready to receive data
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        // No automatic webhook creation - user must configure in Datadog
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        // No automatic webhook deletion - user must manage in Datadog
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData() as Record<string, any>;
    const events = this.getNodeParameter('events') as string[];
    const options = this.getNodeParameter('options') as Record<string, any>;

    // Parse the event type from the webhook payload
    let eventType: string | undefined;
    
    // Datadog sends different payload formats, normalize the event type
    if (body.alert_transition) {
      const transition = body.alert_transition.toLowerCase();
      if (transition.includes('triggered') || transition.includes('alert')) {
        eventType = 'alert';
      } else if (transition.includes('recovered')) {
        eventType = 'recovery';
      } else if (transition.includes('warn')) {
        eventType = 'warn';
      } else if (transition.includes('no data')) {
        eventType = 'no_data';
      } else if (transition.includes('renotify')) {
        eventType = 'renotify';
      }
    }

    // Also check EVENT_TYPE if present
    if (!eventType && body.event_type) {
      const et = body.event_type.toLowerCase();
      if (et.includes('alert')) eventType = 'alert';
      else if (et.includes('recovery')) eventType = 'recovery';
      else if (et.includes('warn')) eventType = 'warn';
      else if (et.includes('no_data')) eventType = 'no_data';
      else if (et.includes('renotify')) eventType = 'renotify';
    }

    // If we couldn't determine event type, treat as alert
    if (!eventType) {
      eventType = 'alert';
    }

    // Check if this event type is in the selected events
    if (!events.includes(eventType)) {
      return {
        noWebhookResponse: true,
      };
    }

    // Apply tag filter if configured
    if (options.filterTags) {
      const filterTags = options.filterTags.split(',').map((t: string) => t.trim().toLowerCase());
      const webhookTags = (body.tags || '').toLowerCase().split(',').map((t: string) => t.trim());
      
      // Check if any filter tag matches the webhook tags
      const hasMatchingTag = filterTags.some((ft: string) => 
        webhookTags.some((wt: string) => wt.includes(ft))
      );
      
      if (!hasMatchingTag) {
        return {
          noWebhookResponse: true,
        };
      }
    }

    // Apply priority filter if configured
    if (options.filterPriority && options.filterPriority.length > 0) {
      const priority = body.priority || body.PRIORITY || '';
      if (!options.filterPriority.includes(priority)) {
        return {
          noWebhookResponse: true,
        };
      }
    }

    // Normalize and enhance the webhook data
    const normalizedData = {
      // Original body
      ...body,
      
      // Normalized fields
      _normalized: {
        eventType,
        monitorId: body.id || body.monitor_id || body.MONITOR_ID,
        monitorName: body.monitor_name || body.MONITOR_NAME || body.title,
        alertTitle: body.alert_title || body.ALERT_TITLE || body.title,
        alertTransition: body.alert_transition || body.ALERT_TRANSITION,
        alertStatus: body.alert_status || body.ALERT_STATUS,
        hostname: body.host || body.hostname || body.HOSTNAME,
        link: body.link || body.LINK,
        tags: body.tags || body.TAGS,
        priority: body.priority || body.PRIORITY,
        message: body.event_msg || body.EVENT_MSG || body.message,
        date: body.date || body.DATE || new Date().toISOString(),
        lastUpdated: body.last_updated || body.LAST_UPDATED,
      },
    };

    return {
      workflowData: [
        this.helpers.returnJsonArray(normalizedData),
      ],
    };
  }
}
