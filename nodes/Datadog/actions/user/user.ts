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

export const userOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['user'],
      },
    },
    options: [
      {
        name: 'Create User',
        value: 'createUser',
        description: 'Create a new user',
        action: 'Create a user',
      },
      {
        name: 'Get All Users',
        value: 'getAllUsers',
        action: 'Get all users',
      },
      {
        name: 'Get User',
        value: 'getUser',
        description: 'Get a specific user',
        action: 'Get a user',
      },
      {
        name: 'Update User',
        value: 'updateUser',
        description: 'Update a user',
        action: 'Update a user',
      },
      {
        name: 'Disable User',
        value: 'disableUser',
        description: 'Disable a user',
        action: 'Disable a user',
      },
      {
        name: 'Send Invitation',
        value: 'sendInvitation',
        description: 'Send user invitation',
        action: 'Send user invitation',
      },
      {
        name: 'Get Organization',
        value: 'getOrg',
        description: 'Get organization info',
        action: 'Get organization info',
      },
      {
        name: 'Update Organization',
        value: 'updateOrg',
        action: 'Update organization',
      },
      {
        name: 'Get Roles',
        value: 'getRoles',
        description: 'Get all roles',
        action: 'Get all roles',
      },
      {
        name: 'Create Role',
        value: 'createRole',
        description: 'Create a new role',
        action: 'Create a role',
      },
      {
        name: 'Get Permissions',
        value: 'getPermissions',
        description: 'Get all permissions',
        action: 'Get all permissions',
      },
    ],
    default: 'getAllUsers',
  },
];

export const userFields: INodeProperties[] = [
  // User ID
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['getUser', 'updateUser', 'disableUser'],
      },
    },
    default: '',
    description: 'The ID of the user',
  },

  // Get All Users options
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['getAllUsers', 'getRoles'],
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
        resource: ['user'],
        operation: ['getAllUsers', 'getRoles'],
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
        resource: ['user'],
        operation: ['getAllUsers'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Filter',
        name: 'filter',
        type: 'string',
        default: '',
        description: 'Filter users by string (email, name, etc.)',
      },
      {
        displayName: 'Filter Status',
        name: 'filter_status',
        type: 'options',
        options: [
          { name: 'Active', value: 'Active' },
          { name: 'Pending', value: 'Pending' },
          { name: 'Disabled', value: 'Disabled' },
        ],
        default: 'Active',
        description: 'Filter by user status',
      },
    ],
  },

  // Create User fields
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    placeholder: 'name@email.com',
    required: true,
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['createUser', 'sendInvitation'],
      },
    },
    default: '',
    description: 'Email address of the user',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['createUser'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Full name of the user',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Job title of the user',
      },
    ],
  },

  // Update User fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['updateUser'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Full name of the user',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'Email address of the user',
      },
      {
        displayName: 'Disabled',
        name: 'disabled',
        type: 'boolean',
        default: false,
        description: 'Whether the user is disabled',
      },
    ],
  },

  // Update Organization fields
  {
    displayName: 'Organization Fields',
    name: 'orgFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['updateOrg'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Organization name',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Organization description',
      },
      {
        displayName: 'Settings',
        name: 'settings',
        type: 'json',
        default: '{}',
        description: 'Organization settings as JSON',
      },
    ],
  },

  // Create Role fields
  {
    displayName: 'Role Name',
    name: 'roleName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['createRole'],
      },
    },
    default: '',
    description: 'Name of the role',
  },
  {
    displayName: 'Role Options',
    name: 'roleOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['createRole'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Permissions',
        name: 'permissions',
        type: 'json',
        default: '[]',
        description: 'Array of permission IDs to grant to this role',
      },
    ],
  },

  // Invitation fields
  {
    displayName: 'Invitation Options',
    name: 'invitationOptions',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['sendInvitation'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Roles',
        name: 'roles',
        type: 'string',
        default: '',
        description: 'Comma-separated list of role IDs to assign',
      },
    ],
  },
];

export async function executeUserOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: any;

  if (operation === 'createUser') {
    const email = this.getNodeParameter('email', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'users',
        attributes: {
          email,
        },
      },
    };

    if (additionalFields.name) {
      body.data.attributes.name = additionalFields.name;
    }
    if (additionalFields.title) {
      body.data.attributes.title = additionalFields.title;
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/users', body, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'getAllUsers') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const filters = this.getNodeParameter('filters', i) as Record<string, any>;

    const query: Record<string, any> = {};
    if (filters.filter) {
      query.filter = filters.filter;
    }
    if (filters.filter_status) {
      query['filter[status]'] = filters.filter_status;
    }

    if (returnAll) {
      responseData = await datadogApiRequestWithCursor.call(
        this,
        'data',
        'GET',
        '/users',
        {},
        query,
        'v2',
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      query['page[size]'] = limit;
      responseData = await datadogApiRequest.call(this, 'GET', '/users', {}, query, 'v2');
      responseData = responseData.data?.slice(0, limit) || [];
    }
  }

  if (operation === 'getUser') {
    const userId = this.getNodeParameter('userId', i) as string;
    responseData = await datadogApiRequest.call(this, 'GET', `/users/${userId}`, {}, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'updateUser') {
    const userId = this.getNodeParameter('userId', i) as string;
    const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'users',
        id: userId,
        attributes: {},
      },
    };

    if (updateFields.name) {
      body.data.attributes.name = updateFields.name;
    }
    if (updateFields.email) {
      body.data.attributes.email = updateFields.email;
    }
    if (updateFields.disabled !== undefined) {
      body.data.attributes.disabled = updateFields.disabled;
    }

    responseData = await datadogApiRequest.call(this, 'PATCH', `/users/${userId}`, body, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'disableUser') {
    const userId = this.getNodeParameter('userId', i) as string;
    await datadogApiRequest.call(this, 'DELETE', `/users/${userId}`, {}, {}, 'v2');
    responseData = { disabled: true, userId };
  }

  if (operation === 'sendInvitation') {
    const email = this.getNodeParameter('email', i) as string;
    const invitationOptions = this.getNodeParameter('invitationOptions', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: [
        {
          type: 'user_invitations',
          relationships: {
            user: {
              data: {
                type: 'users',
                attributes: {
                  email,
                },
              },
            },
          },
        },
      ],
    };

    if (invitationOptions.roles) {
      body.data[0].relationships.roles = {
        data: invitationOptions.roles.split(',').map((roleId: string) => ({
          type: 'roles',
          id: roleId.trim(),
        })),
      };
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/user_invitations', body, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'getOrg') {
    responseData = await datadogApiRequest.call(this, 'GET', '/org', {}, {});
    responseData = responseData.org;
  }

  if (operation === 'updateOrg') {
    const orgFields = this.getNodeParameter('orgFields', i) as Record<string, any>;

    // First get the current organization
    const currentOrg = await datadogApiRequest.call(this, 'GET', '/org', {}, {});
    const publicId = currentOrg.org.public_id;

    const body: Record<string, any> = {};

    if (orgFields.name) {
      body.name = orgFields.name;
    }
    if (orgFields.description) {
      body.description = orgFields.description;
    }
    if (orgFields.settings) {
      body.settings = parseJsonParameter(orgFields.settings);
    }

    responseData = await datadogApiRequest.call(this, 'PUT', `/org/${publicId}`, body, {});
    responseData = responseData.org;
  }

  if (operation === 'getRoles') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
      responseData = await datadogApiRequestWithCursor.call(
        this,
        'data',
        'GET',
        '/roles',
        {},
        {},
        'v2',
      );
    } else {
      const limit = this.getNodeParameter('limit', i) as number;
      responseData = await datadogApiRequest.call(this, 'GET', '/roles', {}, { 'page[size]': limit }, 'v2');
      responseData = responseData.data?.slice(0, limit) || [];
    }
  }

  if (operation === 'createRole') {
    const roleName = this.getNodeParameter('roleName', i) as string;
    const roleOptions = this.getNodeParameter('roleOptions', i) as Record<string, any>;

    const body: Record<string, any> = {
      data: {
        type: 'roles',
        attributes: {
          name: roleName,
        },
      },
    };

    if (roleOptions.permissions) {
      const permissions = parseJsonParameter(roleOptions.permissions) as string[];
      body.data.relationships = {
        permissions: {
          data: permissions.map((permId: string) => ({
            type: 'permissions',
            id: permId,
          })),
        },
      };
    }

    responseData = await datadogApiRequest.call(this, 'POST', '/roles', body, {}, 'v2');
    responseData = responseData.data;
  }

  if (operation === 'getPermissions') {
    responseData = await datadogApiRequest.call(this, 'GET', '/permissions', {}, {}, 'v2');
    responseData = responseData.data || [];
  }

  const executionData = this.helpers.constructExecutionMetaData(
    this.helpers.returnJsonArray(responseData),
    { itemData: { item: i } },
  );

  return executionData;
}
