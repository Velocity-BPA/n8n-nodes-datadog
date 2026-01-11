# n8n-nodes-datadog

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Datadog providing 12 resources and 100+ operations for complete observability workflow automation including metrics, monitors, dashboards, events, logs, APM, synthetics, incidents, SLOs, and more.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Datadog](https://img.shields.io/badge/Datadog-API%20Integration-purple)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **12 Complete Resources**: Full coverage of Datadog's observability platform
- **100+ Operations**: Comprehensive API access for all major Datadog features
- **Multi-Region Support**: US1, US3, US5, EU, AP1, US1-FED regions
- **Dual API Version Support**: Both V1 and V2 APIs with appropriate pagination
- **Trigger Node**: Webhook-based alerts for monitor notifications
- **Full TypeScript**: Complete type definitions for all operations

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings > Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-datadog`
5. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-datadog
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-datadog.git
cd n8n-nodes-datadog

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-datadog

# Restart n8n
n8n start
```

## Credentials Setup

To use this node, you need a Datadog API key and Application key.

| Field | Description |
|-------|-------------|
| **API Key** | Your Datadog API key (Organization Settings > API Keys) |
| **Application Key** | Your Datadog Application key (Organization Settings > Application Keys) |
| **Region** | Your Datadog region (US1, US3, US5, EU, AP1, US1-FED) |

### Getting Your Keys

1. Log into Datadog
2. Navigate to **Organization Settings > API Keys**
3. Create or copy your API Key
4. Navigate to **Organization Settings > Application Keys**
5. Create an Application Key
6. Select your region based on your Datadog account

## Resources & Operations

### Metric
Query, submit, and manage metrics data.

| Operation | Description |
|-----------|-------------|
| Get All | List all metrics |
| Get Metadata | Get metric metadata |
| Update Metadata | Update metric metadata |
| Query | Query metric timeseries |
| Submit | Submit metric data points |
| Get Active Tags | Get active tags for metric |
| Get Tags | Get tags for metric |
| Update Tags | Update tag configuration |
| Delete Tag Config | Delete tag configuration |
| Get Volumes | Get ingestion volumes |
| Estimate Cardinality | Estimate tag cardinality |

### Monitor
Create and manage alerting monitors.

| Operation | Description |
|-----------|-------------|
| Create | Create a new monitor |
| Get All | List all monitors |
| Get | Get monitor details |
| Update | Update a monitor |
| Delete | Delete a monitor |
| Validate | Validate monitor configuration |
| Mute | Mute a monitor |
| Unmute | Unmute a monitor |
| Mute All | Mute all monitors |
| Unmute All | Unmute all monitors |
| Search Groups | Search monitor groups |
| Force Delete | Force delete a monitor |

### Dashboard
Create and manage visualization dashboards.

| Operation | Description |
|-----------|-------------|
| Create | Create a dashboard |
| Get All | List all dashboards |
| Get | Get dashboard details |
| Update | Update a dashboard |
| Delete | Delete a dashboard |
| Get Public URL | Get public sharing URL |
| Delete Public URL | Remove public URL |
| Restore | Restore deleted dashboard |

### Event
Post and query events.

| Operation | Description |
|-----------|-------------|
| Create | Post an event |
| Get All | Query events |
| Get | Get event details |

### Log
Submit and search log entries.

| Operation | Description |
|-----------|-------------|
| Submit | Submit log entries |
| Search | Search logs |
| Aggregate | Aggregate log data |
| Get Indexes | List log indexes |
| Create Index | Create log index |
| Update Index | Update log index |
| Delete Index | Delete log index |
| Get Pipelines | List log pipelines |
| Create Pipeline | Create pipeline |
| Update Pipeline | Update pipeline |
| Delete Pipeline | Delete pipeline |

### APM (Traces)
Search and analyze application traces.

| Operation | Description |
|-----------|-------------|
| Search Traces | Search traces |
| Get Trace Services | List traced services |
| Get Service Summary | Get service statistics |
| Get Service Dependencies | Get dependencies |
| Get Resource Stats | Get resource statistics |
| Get Span Tags | Get span tags |

### Synthetics
Manage synthetic monitoring tests.

| Operation | Description |
|-----------|-------------|
| Create Test | Create synthetic test |
| Get All Tests | List all tests |
| Get Test | Get test details |
| Update Test | Update test |
| Delete Test | Delete test |
| Trigger Test | Trigger test run |
| Get Test Results | Get test results |
| Get Global Variables | List global variables |
| Create Global Variable | Create global variable |
| Update Global Variable | Update global variable |
| Delete Global Variable | Delete global variable |
| Get Locations | List test locations |

### Incident
Manage incidents and timelines.

| Operation | Description |
|-----------|-------------|
| Create | Create incident |
| Get All | List incidents |
| Get | Get incident details |
| Update | Update incident |
| Delete | Delete incident |
| Add Attachment | Add attachment |
| Get Timeline | Get incident timeline |
| Add Timeline Cell | Add timeline entry |
| Update Timeline Cell | Update timeline entry |
| Delete Timeline Cell | Delete timeline entry |

### SLO (Service Level Objectives)
Manage SLOs and corrections.

| Operation | Description |
|-----------|-------------|
| Create | Create an SLO |
| Get All | List all SLOs |
| Get | Get SLO details |
| Update | Update SLO |
| Delete | Delete SLO |
| Get History | Get SLO history |
| Get Corrections | Get corrections |
| Create Correction | Create correction |
| Delete Correction | Delete correction |

### Notebook
Create and manage notebooks.

| Operation | Description |
|-----------|-------------|
| Create | Create notebook |
| Get All | List notebooks |
| Get | Get notebook details |
| Update | Update notebook |
| Delete | Delete notebook |

### Downtime
Schedule and manage maintenance windows.

| Operation | Description |
|-----------|-------------|
| Create | Schedule downtime |
| Get All | List downtimes |
| Get | Get downtime details |
| Update | Update downtime |
| Cancel | Cancel downtime |

### User
Manage users, roles, and organization.

| Operation | Description |
|-----------|-------------|
| Create User | Create user |
| Get All Users | List users |
| Get User | Get user details |
| Update User | Update user |
| Disable User | Disable user |
| Send Invitation | Send invitation |
| Get Organization | Get organization info |
| Update Organization | Update organization |
| Get Roles | List roles |
| Create Role | Create role |
| Get Permissions | List permissions |

## Trigger Node

The Datadog Trigger node receives webhook notifications from Datadog monitors.

### Supported Events

- **Monitor Alert**: When a monitor triggers an alert
- **Monitor Warning**: When a monitor triggers a warning
- **Monitor Recovery**: When a monitor recovers
- **Monitor No Data**: When a monitor enters no-data state
- **Monitor Renotify**: When a monitor renotifies

### Webhook Setup

1. Create or edit a monitor in Datadog
2. In the notification section, add: `@webhook-{your_webhook_name}`
3. Configure the webhook in **Integrations > Webhooks**
4. Set the n8n webhook URL as the endpoint

## Usage Examples

### Submit Custom Metrics

```json
{
  "resource": "metric",
  "operation": "submit",
  "metricName": "custom.app.requests",
  "metricType": "count",
  "points": [[1609459200, 100]],
  "tags": ["env:production", "service:api"]
}
```

### Create a Monitor

```json
{
  "resource": "monitor",
  "operation": "create",
  "name": "High CPU Alert",
  "type": "metric alert",
  "query": "avg(last_5m):avg:system.cpu.user{*} > 80",
  "message": "CPU usage is above 80%!"
}
```

### Search Logs

```json
{
  "resource": "log",
  "operation": "search",
  "query": "status:error service:api",
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-01-02T00:00:00Z"
}
```

## Regions

| Region | Base URL |
|--------|----------|
| US1 | https://api.datadoghq.com |
| US3 | https://api.us3.datadoghq.com |
| US5 | https://api.us5.datadoghq.com |
| EU | https://api.datadoghq.eu |
| AP1 | https://api.ap1.datadoghq.com |
| US1-FED | https://api.ddog-gov.com |

## Error Handling

The node handles common Datadog API errors:

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Invalid Application key or insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 429 | Too Many Requests - Rate limit exceeded |

## Security Best Practices

1. **Use Environment Variables**: Store API keys in n8n credentials, never in workflows
2. **Minimum Permissions**: Create Application keys with only required scopes
3. **Rotate Keys**: Regularly rotate API and Application keys
4. **Monitor Access**: Use Datadog's audit logs to track API usage
5. **Regional Compliance**: Select appropriate region for data residency requirements

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-datadog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-datadog/discussions)
- **Commercial Support**: licensing@velobpa.com

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Datadog](https://www.datadoghq.com) - Monitoring and analytics platform
