const express = require('express');
const router = express.Router();
const system = require('../data/system');

// GET /system/health
router.get('/health', (req, res) => {
  const healthData = { ...system.health };
  
  // Update real-time metrics
  healthData.metrics = {
    ...healthData.metrics,
    cpu: `${Math.floor(Math.random() * 40) + 10}%`, // Random CPU usage between 10-50%
    memory: `${Math.floor(Math.random() * 50) + 20}%`, // Random memory usage between 20-70%
    requestsPerMinute: Math.floor(Math.random() * 150) + 50 // Random requests between 50-200 per minute
  };
  
  // Update uptime
  const now = new Date();
  const hoursSinceStartup = Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15)) / 3600000);
  
  healthData.services = healthData.services.map(service => ({
    ...service,
    uptime: `15d ${hoursSinceStartup % 24}h ${Math.floor(Math.random() * 60)}m`
  }));
  
  // Check for any service issues
  const hasIssues = Math.random() < 0.05; // 5% chance of an issue
  if (hasIssues) {
    const serviceIndex = Math.floor(Math.random() * healthData.services.length);
    healthData.services[serviceIndex].status = 'degraded';
    healthData.status = 'degraded';
  }
  
  res.json(healthData);
});

// GET /system/version
router.get('/version', (req, res) => {
  res.json(system.version);
});

module.exports = router; 