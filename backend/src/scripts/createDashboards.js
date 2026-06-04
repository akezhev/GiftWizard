const axios = require('axios');
const config = require('../src/config/validateEnv');
const { logger } = require('../src/monitoring/logger');

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3001';
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

const dashboards = [
  {
    title: 'GiftWizard - API Performance',
    uid: 'giftwizard-api',
    tags: ['giftwizard', 'api', 'performance'],
    panels: [
      {
        title: 'Request Rate',
        type: 'graph',
        targets: [
          {
            expr: 'sum(rate(giftwizard_http_requests_total[5m]))',
            legendFormat: 'Requests/sec',
          },
        ],
      },
      {
        title: 'Response Time (p95)',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, sum(rate(giftwizard_http_request_duration_seconds_bucket[5m])) by (le))',
            legendFormat: 'p95 latency',
          },
        ],
      },
      {
        title: 'Error Rate',
        type: 'graph',
        targets: [
          {
            expr: 'sum(rate(giftwizard_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(giftwizard_http_requests_total[5m])) * 100',
            legendFormat: 'Error %',
          },
        ],
      },
      {
        title: 'Active Users',
        type: 'stat',
        targets: [
          {
            expr: 'giftwizard_active_users',
            legendFormat: 'Active Users',
          },
        ],
      },
    ],
  },
  {
    title: 'GiftWizard - Database',
    uid: 'giftwizard-database',
    tags: ['giftwizard', 'database', 'postgres'],
    panels: [
      {
        title: 'Database Query Duration',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, sum(rate(giftwizard_db_query_duration_seconds_bucket[5m])) by (le, operation))',
            legendFormat: '{{ operation }}',
          },
        ],
      },
      {
        title: 'Active Connections',
        type: 'graph',
        targets: [
          {
            expr: 'pg_stat_database_numbackends',
            legendFormat: 'Connections',
          },
        ],
      },
      {
        title: 'Cache Hit Ratio',
        type: 'gauge',
        targets: [
          {
            expr: 'giftwizard_cache_hit_ratio * 100',
            legendFormat: 'Hit %',
          },
        ],
        options: {
          min: 0,
          max: 100,
          unit: 'percent',
        },
      },
    ],
  },
  {
    title: 'GiftWizard - AI & Queue',
    uid: 'giftwizard-ai',
    tags: ['giftwizard', 'ai', 'queue'],
    panels: [
      {
        title: 'AI Requests',
        type: 'graph',
        targets: [
          {
            expr: 'sum(rate(giftwizard_ai_requests_total[5m])) by (status)',
            legendFormat: '{{ status }}',
          },
        ],
      },
      {
        title: 'Queue Size',
        type: 'graph',
        targets: [
          {
            expr: 'giftwizard_queue_size',
            legendFormat: '{{ queue }}',
          },
        ],
      },
      {
        title: 'Job Processing Time',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, sum(rate(job_duration_seconds_bucket[5m])) by (le, queue))',
            legendFormat: '{{ queue }}',
          },
        ],
      },
    ],
  },
];

const createDashboard = async (dashboard) => {
  try {
    const response = await axios.post(
      `${GRAFANA_URL}/api/dashboards/db`,
      {
        dashboard: {
          id: null,
          uid: dashboard.uid,
          title: dashboard.title,
          tags: dashboard.tags,
          timezone: 'browser',
          panels: dashboard.panels.map((panel, index) => ({
            id: index + 1,
            title: panel.title,
            type: panel.type,
            gridPos: {
              h: 8,
              w: 12,
              x: (index % 2) * 12,
              y: Math.floor(index / 2) * 8,
            },
            targets: panel.targets,
            options: panel.options || {},
          })),
          refresh: '30s',
          time: {
            from: 'now-1h',
            to: 'now',
          },
        },
        overwrite: true,
      },
      {
        headers: {
          Authorization: `Bearer ${GRAFANA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    logger.info(`Dashboard created: ${dashboard.title}`, { uid: dashboard.uid });
    return response.data;
  } catch (error) {
    logger.error(`Failed to create dashboard ${dashboard.title}:`, error.message);
    throw error;
  }
};

const createDataSources = async () => {
  const dataSources = [
    {
      name: 'Prometheus',
      type: 'prometheus',
      url: 'http://prometheus:9090',
      access: 'proxy',
      isDefault: true,
    },
    {
      name: 'Loki',
      type: 'loki',
      url: 'http://loki:3100',
      access: 'proxy',
    },
  ];
  
  for (const ds of dataSources) {
    try {
      await axios.post(
        `${GRAFANA_URL}/api/datasources`,
        ds,
        {
          headers: {
            Authorization: `Bearer ${GRAFANA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info(`Data source created: ${ds.name}`);
    } catch (error) {
      if (error.response?.status === 409) {
        logger.info(`Data source already exists: ${ds.name}`);
      } else {
        logger.error(`Failed to create data source ${ds.name}:`, error.message);
      }
    }
  }
};

const createAlerts = async () =>