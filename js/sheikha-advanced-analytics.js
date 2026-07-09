/**
 * 📊 منصة سحابة شيخة — نظام التحليلات المتقدم
 * Sheikha Cloud Platform — Advanced Analytics System
 * 
 * ملف: js/sheikha-advanced-analytics.js
 * الحجم: ~600 سطر
 * الوصف: تحليلات متقدمة وتقارير ذكية
 */

class SheikhaAdvancedAnalytics {
  constructor(mongoConnection, redisConnection) {
    this.db = mongoConnection;
    this.cache = redisConnection;
    this.metrics = new Map();
    this.reports = [];
    this.dashboards = this.initializeDashboards();
  }

  /**
   * ========== Dashboard Initialization ==========
   */

  initializeDashboards() {
    return {
      'overview': {
        title: 'Platform Overview',
        widgets: [
          'total-apps',
          'total-users',
          'system-health',
          'revenue-metrics'
        ]
      },
      'performance': {
        title: 'Performance Analytics',
        widgets: [
          'cpu-usage',
          'memory-usage',
          'network-traffic',
          'latency-trends'
        ]
      },
      'business': {
        title: 'Business Metrics',
        widgets: [
          'revenue-forecast',
          'subscription-trends',
          'churn-rate',
          'customer-growth'
        ]
      },
      'security': {
        title: 'Security Analytics',
        widgets: [
          'failed-logins',
          'api-abuse-detection',
          'audit-trail',
          'compliance-status'
        ]
      }
    };
  }

  /**
   * ========== Metrics Collection ==========
   */

  async collectMetrics(appId, metrics) {
    try {
      const timestamp = Date.now();
      const key = `metrics:${appId}:${timestamp}`;

      // تخزين المقاييس في Redis للوصول السريع
      await this.cache.setex(
        key,
        86400, // 24 ساعة
        JSON.stringify(metrics)
      );

      // حفظ في MongoDB للأرشفة
      await this.db.collection('metrics').insertOne({
        appId,
        ...metrics,
        timestamp,
        _ttl: new Date(Date.now() + 90 * 24 * 3600000) // 90 يوم
      });

      // تحديث المقاييس المجمعة
      this.updateAggregatedMetrics(appId, metrics);

      console.log(`✅ Metrics collected for app: ${appId}`);
      return { success: true };
    } catch (error) {
      console.error('Error collecting metrics:', error);
      throw error;
    }
  }

  updateAggregatedMetrics(appId, metrics) {
    if (!this.metrics.has(appId)) {
      this.metrics.set(appId, {
        cpu: [],
        memory: [],
        requests: [],
        errors: [],
        latency: []
      });
    }

    const appMetrics = this.metrics.get(appId);
    appMetrics.cpu.push(metrics.cpu || 0);
    appMetrics.memory.push(metrics.memory || 0);
    appMetrics.requests.push(metrics.requests || 0);
    appMetrics.errors.push(metrics.errors || 0);
    appMetrics.latency.push(metrics.latency || 0);

    // الاحتفاظ فقط بـ 1440 نقطة بيانات (24 ساعة بمعدل دقيقة واحدة)
    if (appMetrics.cpu.length > 1440) {
      appMetrics.cpu.shift();
      appMetrics.memory.shift();
      appMetrics.requests.shift();
      appMetrics.errors.shift();
      appMetrics.latency.shift();
    }
  }

  /**
   * ========== Analytics Calculation ==========
   */

  async calculateAnalytics(appId, timeRange = '24h') {
    try {
      const startTime = this.getStartTime(timeRange);
      
      const metrics = await this.db.collection('metrics')
        .find({
          appId,
          timestamp: { $gte: startTime }
        })
        .toArray();

      if (metrics.length === 0) {
        return null;
      }

      const analytics = {
        appId,
        timeRange,
        period: {
          start: new Date(startTime),
          end: new Date()
        },
        cpu: this.calculateStats(metrics, 'cpu'),
        memory: this.calculateStats(metrics, 'memory'),
        requests: this.calculateStats(metrics, 'requests'),
        errors: this.calculateStats(metrics, 'errors'),
        latency: this.calculateStats(metrics, 'latency'),
        uptime: this.calculateUptime(metrics),
        peakHours: this.identifyPeakHours(metrics),
        trends: this.calculateTrends(metrics)
      };

      // تخزين التقرير
      this.reports.push({
        id: `report_${Date.now()}`,
        ...analytics,
        generatedAt: new Date().toISOString()
      });

      return analytics;
    } catch (error) {
      console.error('Error calculating analytics:', error);
      throw error;
    }
  }

  calculateStats(metrics, field) {
    const values = metrics
      .map(m => m[field])
      .filter(v => typeof v === 'number');

    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
    }

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: (sum / values.length).toFixed(2),
      p95: sorted[Math.ceil(values.length * 0.95) - 1],
      p99: sorted[Math.ceil(values.length * 0.99) - 1],
      median: sorted[Math.floor(values.length / 2)]
    };
  }

  calculateUptime(metrics) {
    const healthy = metrics.filter(m => m.status === 'healthy').length;
    const total = metrics.length;
    return total > 0 ? ((healthy / total) * 100).toFixed(2) + '%' : '0%';
  }

  identifyPeakHours(metrics) {
    const hourlyData = {};

    metrics.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { requests: 0, count: 0 };
      }
      hourlyData[hour].requests += m.requests || 0;
      hourlyData[hour].count++;
    });

    const peaks = Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgRequests: data.requests / data.count
      }))
      .sort((a, b) => b.avgRequests - a.avgRequests)
      .slice(0, 5);

    return peaks;
  }

  calculateTrends(metrics) {
    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const avgFirstCpu = firstHalf.reduce((sum, m) => sum + (m.cpu || 0), 0) / firstHalf.length;
    const avgSecondCpu = secondHalf.reduce((sum, m) => sum + (m.cpu || 0), 0) / secondHalf.length;

    const avgFirstReq = firstHalf.reduce((sum, m) => sum + (m.requests || 0), 0) / firstHalf.length;
    const avgSecondReq = secondHalf.reduce((sum, m) => sum + (m.requests || 0), 0) / secondHalf.length;

    return {
      cpuTrend: avgSecondCpu > avgFirstCpu ? 'increasing' : 'decreasing',
      cpuChange: ((avgSecondCpu - avgFirstCpu) / avgFirstCpu * 100).toFixed(2) + '%',
      requestTrend: avgSecondReq > avgFirstReq ? 'increasing' : 'decreasing',
      requestChange: ((avgSecondReq - avgFirstReq) / avgFirstReq * 100).toFixed(2) + '%'
    };
  }

  /**
   * ========== Forecasting ==========
   */

  async forecastMetrics(appId, hoursAhead = 24) {
    try {
      const metrics = this.metrics.get(appId);
      
      if (!metrics || metrics.cpu.length < 10) {
        return null; // Need at least 10 data points
      }

      const forecast = {
        appId,
        hoursAhead,
        forecastedAt: new Date().toISOString(),
        cpu: this.simpleMovingAverage(metrics.cpu, hoursAhead),
        memory: this.simpleMovingAverage(metrics.memory, hoursAhead),
        requests: this.simpleMovingAverage(metrics.requests, hoursAhead)
      };

      return forecast;
    } catch (error) {
      console.error('Error forecasting metrics:', error);
      return null;
    }
  }

  simpleMovingAverage(values, periods) {
    if (values.length === 0) return [];

    const sma = [];
    const window = Math.min(7, values.length); // 7-period average

    for (let i = 0; i < periods; i++) {
      const lastValues = values.slice(-window);
      const avg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
      sma.push(avg);
    }

    return sma;
  }

  /**
   * ========== Anomaly Detection ==========
   */

  async detectAnomalies(appId, threshold = 2) {
    try {
      const metrics = this.metrics.get(appId);
      
      if (!metrics) {
        return [];
      }

      const anomalies = [];
      const fields = ['cpu', 'memory', 'latency'];

      for (const field of fields) {
        const values = metrics[field];
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        );

        values.forEach((value, index) => {
          const zScore = Math.abs((value - mean) / stdDev);
          if (zScore > threshold) {
            anomalies.push({
              field,
              value,
              mean,
              zScore,
              timestamp: Date.now() - (values.length - index) * 60000
            });
          }
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * ========== Report Generation ==========
   */

  async generateReport(appId, format = 'json') {
    try {
      const analytics = await this.calculateAnalytics(appId, '24h');
      const forecast = await this.forecastMetrics(appId);
      const anomalies = await this.detectAnomalies(appId);

      const report = {
        appId,
        generatedAt: new Date().toISOString(),
        analytics,
        forecast,
        anomalies,
        recommendations: this.generateRecommendations(analytics, anomalies)
      };

      if (format === 'json') {
        return report;
      } else if (format === 'html') {
        return this.generateHTMLReport(report);
      }

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  generateRecommendations(analytics, anomalies) {
    const recommendations = [];

    if (!analytics) return recommendations;

    // CPU recommendations
    if (analytics.cpu.avg > 80) {
      recommendations.push({
        type: 'CPU',
        severity: 'high',
        message: 'High CPU usage detected. Consider scaling up.',
        action: 'Scale replicas or increase CPU allocation'
      });
    }

    // Memory recommendations
    if (analytics.memory.avg > 85) {
      recommendations.push({
        type: 'MEMORY',
        severity: 'high',
        message: 'High memory usage detected.',
        action: 'Optimize code or increase memory allocation'
      });
    }

    // Latency recommendations
    if (analytics.latency.p95 > 1000) {
      recommendations.push({
        type: 'LATENCY',
        severity: 'medium',
        message: 'High p95 latency detected.',
        action: 'Check database queries and optimize code'
      });
    }

    // Error rate recommendations
    if (analytics.errors.avg > 0.1) {
      recommendations.push({
        type: 'ERRORS',
        severity: 'high',
        message: 'High error rate detected.',
        action: 'Review application logs and fix issues'
      });
    }

    // Anomaly recommendations
    if (anomalies.length > 5) {
      recommendations.push({
        type: 'ANOMALIES',
        severity: 'medium',
        message: `${anomalies.length} anomalies detected in the past 24 hours.`,
        action: 'Investigate unusual patterns'
      });
    }

    return recommendations;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Report - ${report.appId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metric { margin: 20px 0; padding: 10px; background: #f5f5f5; }
    .high { color: #d32f2f; }
    .medium { color: #f57c00; }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <p>Generated: ${report.generatedAt}</p>
  <p>Application: ${report.appId}</p>

  <h2>Performance Metrics</h2>
  <div class="metric">
    <h3>CPU</h3>
    <p>Average: ${report.analytics.cpu.avg}%</p>
    <p>Peak: ${report.analytics.cpu.max}%</p>
  </div>

  <h2>Recommendations</h2>
  <ul>
    ${report.recommendations.map(r => `
      <li class="${r.severity}">
        <strong>${r.type}</strong>: ${r.message}<br/>
        Action: ${r.action}
      </li>
    `).join('')}
  </ul>
</body>
</html>
    `;
  }

  /**
   * ========== Utilities ==========
   */

  getStartTime(timeRange) {
    const now = Date.now();
    const units = { h: 3600000, d: 86400000, w: 604800000, m: 2592000000 };
    const match = timeRange.match(/^(\d+)([hdwm])$/);
    
    if (!match) return now - 3600000;
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    return now - (amount * (units[unit] || 3600000));
  }

  /**
   * ========== REST API Routes ==========
   */

  setupAnalyticsRoutes(app) {
    // Collect metrics
    app.post('/api/analytics/:appId/metrics', async (req, res) => {
      try {
        await this.collectMetrics(req.params.appId, req.body);
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Get analytics
    app.get('/api/analytics/:appId', async (req, res) => {
      try {
        const analytics = await this.calculateAnalytics(
          req.params.appId,
          req.query.timeRange || '24h'
        );
        res.json(analytics);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Get forecast
    app.get('/api/analytics/:appId/forecast', async (req, res) => {
      try {
        const forecast = await this.forecastMetrics(
          req.params.appId,
          req.query.hours || 24
        );
        res.json(forecast);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Generate report
    app.get('/api/analytics/:appId/report', async (req, res) => {
      try {
        const report = await this.generateReport(
          req.params.appId,
          req.query.format || 'json'
        );
        res.json(report);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }
}

module.exports = SheikhaAdvancedAnalytics;
