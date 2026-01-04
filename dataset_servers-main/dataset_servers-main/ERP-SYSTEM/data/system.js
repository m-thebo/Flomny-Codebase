const system = {
  health: {
    status: 'healthy',
    services: [
      { name: 'api', status: 'running', uptime: '15d 7h 23m' },
      { name: 'database', status: 'running', uptime: '15d 7h 22m' },
      { name: 'cache', status: 'running', uptime: '15d 7h 21m' },
      { name: 'queue', status: 'running', uptime: '15d 7h 20m' }
    ],
    metrics: {
      cpu: '25%',
      memory: '45%',
      disk: '32%',
      requests: {
        total: 15478962,
        perMinute: 127
      },
      responseTime: {
        average: '120ms',
        p95: '350ms',
        p99: '500ms'
      }
    }
  },
  version: {
    current: '2.5.1',
    lastUpdated: '2023-03-10',
    details: [
      { component: 'API', version: '2.5.1' },
      { component: 'Frontend', version: '2.5.0' },
      { component: 'Database Schema', version: '2.4.3' }
    ],
    changelog: {
      '2.5.1': 'Security patches and bug fixes',
      '2.5.0': 'Added new finance reporting features',
      '2.4.0': 'Enhanced inventory management capabilities'
    }
  }
};

module.exports = system; 