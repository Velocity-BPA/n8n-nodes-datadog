/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  IHttpRequestMethods,
  IRequestOptions,
  NodeApiError,
} from 'n8n-workflow';
import { REGION_URLS, DEFAULT_PAGE_SIZE, LICENSING_NOTICE } from '../constants/constants';
import { DatadogRegion, ApiVersion } from '../types/DatadogTypes';

let licensingNoticeLogged = false;

function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(LICENSING_NOTICE);
    licensingNoticeLogged = true;
  }
}

export async function datadogApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, any>,
  apiVersion: ApiVersion = 'v1',
): Promise<any> {
  logLicensingNotice();

  const credentials = await this.getCredentials('datadogApi');
  const region = credentials.region as DatadogRegion;
  const baseUrl = REGION_URLS[region] || REGION_URLS['US1'];

  const options: IRequestOptions = {
    method,
    uri: `${baseUrl}/api/${apiVersion}${endpoint}`,
    headers: {
      'DD-API-KEY': credentials.apiKey as string,
      'DD-APPLICATION-KEY': credentials.applicationKey as string,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0 && method !== 'GET') {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await this.helpers.request(options);
    return response;
  } catch (error: any) {
    throw new NodeApiError(this.getNode(), error, {
      message: error.message,
      description: error.error?.errors?.join(', ') || error.description,
    });
  }
}

export async function datadogApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, any>,
  apiVersion: ApiVersion = 'v1',
): Promise<any[]> {
  const returnData: any[] = [];
  let responseData: any;
  let page = 0;
  const pageSize = query?.page_size || DEFAULT_PAGE_SIZE;

  query = query || {};
  query.page_size = pageSize;
  let hasMoreItems = true;

  while (hasMoreItems) {
    query.page_number = page;
    responseData = await datadogApiRequest.call(
      this,
      method,
      endpoint,
      body,
      query,
      apiVersion,
    );

    const items = responseData[propertyName] || responseData.data || [];
    returnData.push(...items);
    page++;

    // Check if we've fetched all items
    const totalCount = responseData.meta?.page?.total_count;
    if (totalCount !== undefined && returnData.length >= totalCount) {
      hasMoreItems = false;
    } else if (items.length === 0 || items.length < pageSize) {
      hasMoreItems = false;
    }
  }

  return returnData;
}

export async function datadogApiRequestWithCursor(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, any>,
  apiVersion: ApiVersion = 'v2',
): Promise<any[]> {
  const returnData: any[] = [];
  let responseData: any;
  let cursor: string | undefined;
  const limit = query?.page?.limit || DEFAULT_PAGE_SIZE;

  query = query || {};

  do {
    if (cursor) {
      query.page = { ...query.page, cursor };
    } else {
      query.page = { ...query.page, limit };
    }

    responseData = await datadogApiRequest.call(
      this,
      method,
      endpoint,
      body,
      query,
      apiVersion,
    );

    const items = responseData[propertyName] || responseData.data || [];
    returnData.push(...items);

    cursor = responseData.meta?.page?.after;
  } while (cursor);

  return returnData;
}

export function getBaseUrl(region: DatadogRegion): string {
  return REGION_URLS[region] || REGION_URLS['US1'];
}

export function parseJsonParameter(value: string | object): object {
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Invalid JSON format');
  }
}

export function prepareTagsArray(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim());
  }
  return [];
}

export function toUnixTimestamp(date: string | number | Date): number {
  if (typeof date === 'number') {
    return date;
  }
  return Math.floor(new Date(date).getTime() / 1000);
}

export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function formatDateForDatadog(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString();
}

export function simplifyResponse(data: any): any {
  // If data has a 'data' property, return that
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
}
