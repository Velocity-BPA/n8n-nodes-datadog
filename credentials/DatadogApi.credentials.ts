/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class DatadogApi implements ICredentialType {
  name = 'datadogApi';
  displayName = 'Datadog API';
  documentationUrl = 'https://docs.datadoghq.com/api/latest/';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Datadog API key. Found in Organization Settings > API Keys.',
    },
    {
      displayName: 'Application Key',
      name: 'applicationKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Datadog Application key. Found in Organization Settings > Application Keys.',
    },
    {
      displayName: 'Region',
      name: 'region',
      type: 'options',
      options: [
        { name: 'US1 (Default)', value: 'US1' },
        { name: 'US3', value: 'US3' },
        { name: 'US5', value: 'US5' },
        { name: 'EU', value: 'EU' },
        { name: 'AP1 (Japan)', value: 'AP1' },
        { name: 'US1-FED (Government)', value: 'US1-FED' },
      ],
      default: 'US1',
      required: true,
      description: 'The Datadog region for your organization',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'DD-API-KEY': '={{$credentials.apiKey}}',
        'DD-APPLICATION-KEY': '={{$credentials.applicationKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.region === "US1" ? "https://api.datadoghq.com" : $credentials.region === "US3" ? "https://api.us3.datadoghq.com" : $credentials.region === "US5" ? "https://api.us5.datadoghq.com" : $credentials.region === "EU" ? "https://api.datadoghq.eu" : $credentials.region === "AP1" ? "https://api.ap1.datadoghq.com" : "https://api.ddog-gov.com"}}',
      url: '/api/v1/validate',
    },
  };
}
