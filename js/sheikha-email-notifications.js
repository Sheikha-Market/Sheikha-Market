/**
 * 📧 منصة سحابة شيخة — نظام الإشعارات عبر البريد الإلكتروني
 * Sheikha Cloud Platform — Email Notification System
 * 
 * ملف: js/sheikha-email-notifications.js
 * الحجم: ~600 سطر
 * الوصف: نظام شامل للإشعارات عبر البريد الإلكتروني
 */

class SheikhaEmailNotifications {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'sendgrid', // sendgrid, mailgun, ses
      apiKey: config.apiKey,
      fromEmail: config.fromEmail || 'noreply@sheikha.cloud',
      fromName: config.fromName || 'Sheikha Cloud',
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort || 587,
      smtpUser: config.smtpUser,
      smtpPass: config.smtpPass
    };

    this.emailQueue = [];
    this.sentEmails = [];
    this.templates = this.initializeTemplates();
    this.subscriptions = new Map();
  }

  /**
   * ========== Email Templates ==========
   */

  initializeTemplates() {
    return {
      'welcome': {
        subject: 'Welcome to Sheikha Cloud Platform',
        htmlTemplate: `
          <h1>Welcome to Sheikha Cloud! 🎉</h1>
          <p>Dear {{userName}},</p>
          <p>Thank you for joining Sheikha Cloud Platform. Your account is now active.</p>
          <p><strong>Account Details:</strong></p>
          <ul>
            <li>Email: {{userEmail}}</li>
            <li>Plan: {{planName}}</li>
            <li>Start Date: {{startDate}}</li>
          </ul>
          <p><a href="{{dashboardUrl}}">Access Your Dashboard</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'deployment-success': {
        subject: 'Deployment Successful - {{appName}}',
        htmlTemplate: `
          <h2>Your application has been deployed! 🚀</h2>
          <p>Dear {{userName}},</p>
          <p>Your application <strong>{{appName}}</strong> has been successfully deployed.</p>
          <p><strong>Deployment Details:</strong></p>
          <ul>
            <li>Application: {{appName}}</li>
            <li>Region: {{region}}</li>
            <li>Replicas: {{replicas}}</li>
            <li>Status: <span style="color: green;"><strong>RUNNING</strong></span></li>
            <li>URL: {{appUrl}}</li>
          </ul>
          <p><a href="{{dashboardUrl}}/apps/{{appId}}">View Application</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'deployment-failed': {
        subject: 'Deployment Failed - {{appName}}',
        htmlTemplate: `
          <h2>Deployment Failed ❌</h2>
          <p>Dear {{userName}},</p>
          <p>Unfortunately, the deployment of <strong>{{appName}}</strong> failed.</p>
          <p><strong>Error Details:</strong></p>
          <pre style="background: #f5f5f5; padding: 10px;">{{errorMessage}}</pre>
          <p><strong>Troubleshooting Steps:</strong></p>
          <ol>
            <li>Check the logs for more information</li>
            <li>Verify your configuration</li>
            <li>Contact support if you need help</li>
          </ol>
          <p><a href="{{dashboardUrl}}/apps/{{appId}}/logs">View Logs</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'alert-triggered': {
        subject: 'Alert Triggered - {{alertName}}',
        htmlTemplate: `
          <h2>⚠️ Alert Triggered</h2>
          <p>Dear {{userName}},</p>
          <p>An alert has been triggered on your application.</p>
          <p><strong>Alert Details:</strong></p>
          <ul>
            <li>Alert: {{alertName}}</li>
            <li>Application: {{appName}}</li>
            <li>Condition: {{condition}}</li>
            <li>Current Value: {{currentValue}}</li>
            <li>Threshold: {{threshold}}</li>
            <li>Time: {{timestamp}}</li>
          </ul>
          <p><a href="{{dashboardUrl}}/monitoring">View Monitoring</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'invoice-ready': {
        subject: 'Invoice #{{invoiceId}} - {{amount}} {{currency}}',
        htmlTemplate: `
          <h2>Invoice Ready 💰</h2>
          <p>Dear {{userName}},</p>
          <p>Your invoice is ready for download.</p>
          <p><strong>Invoice Details:</strong></p>
          <ul>
            <li>Invoice #{{invoiceId}}</li>
            <li>Amount: {{amount}} {{currency}}</li>
            <li>Date: {{invoiceDate}}</li>
            <li>Due Date: {{dueDate}}</li>
            <li>Status: {{status}}</li>
          </ul>
          <p><a href="{{downloadUrl}}">Download Invoice (PDF)</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'subscription-renewal': {
        subject: 'Subscription Renewal - {{planName}}',
        htmlTemplate: `
          <h2>Subscription Renewal 🔄</h2>
          <p>Dear {{userName}},</p>
          <p>Your subscription has been successfully renewed.</p>
          <p><strong>Subscription Details:</strong></p>
          <ul>
            <li>Plan: {{planName}}</li>
            <li>Amount: {{amount}} {{currency}}</li>
            <li>Next Billing Date: {{nextBillingDate}}</li>
            <li>Auto-renewal: {{autoRenewal}}</li>
          </ul>
          <p><a href="{{dashboardUrl}}/billing">Manage Subscription</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      },

      'system-maintenance': {
        subject: 'Scheduled Maintenance Notice',
        htmlTemplate: `
          <h2>Scheduled Maintenance 🔧</h2>
          <p>Dear {{userName}},</p>
          <p>We will be performing scheduled maintenance on our platform.</p>
          <p><strong>Maintenance Details:</strong></p>
          <ul>
            <li>Start Time: {{startTime}}</li>
            <li>Duration: {{duration}}</li>
            <li>Affected Services: {{affectedServices}}</li>
            <li>Expected Impact: {{impact}}</li>
          </ul>
          <p>We apologize for any inconvenience this may cause.</p>
          <p><a href="{{statusPageUrl}}">View Status Page</a></p>
          <p>Best regards,<br/>Sheikha Cloud Team</p>
        `
      }
    };
  }

  /**
   * ========== Send Email ==========
   */

  async sendEmail(to, templateName, variables = {}) {
    try {
      const template = this.templates[templateName];
      
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // استبدال المتغيرات
      let subject = template.subject;
      let htmlContent = template.htmlTemplate;

      for (const [key, value] of Object.entries(variables)) {
        subject = subject.replace(`{{${key}}}`, value);
        htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      const email = {
        id: `email_${Date.now()}`,
        to,
        subject,
        htmlContent,
        templateName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        attempt: 0
      };

      // إضافة إلى قائمة الانتظار
      this.emailQueue.push(email);

      // محاكاة الإرسال
      await this.processEmail(email);

      return email;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async processEmail(email) {
    try {
      // محاكاة إرسال البريد
      if (this.config.provider === 'sendgrid') {
        // await this.sendViaMailGun(email);
      } else if (this.config.provider === 'mailgun') {
        // await this.sendViaMailGun(email);
      } else if (this.config.provider === 'ses') {
        // await this.sendViaSES(email);
      }

      email.status = 'sent';
      email.sentAt = new Date().toISOString();

      this.sentEmails.push(email);
      this.emailQueue = this.emailQueue.filter(e => e.id !== email.id);

      console.log(`✅ Email sent: ${email.to}`);
      console.log(`   Subject: ${email.subject}`);
    } catch (error) {
      email.attempt++;
      
      if (email.attempt < 3) {
        email.status = 'retrying';
        console.log(`⚠️ Email retry: ${email.to} (attempt ${email.attempt})`);
      } else {
        email.status = 'failed';
        email.error = error.message;
        this.sentEmails.push(email);
        this.emailQueue = this.emailQueue.filter(e => e.id !== email.id);
        console.error(`❌ Email failed: ${email.to}`);
      }
    }
  }

  /**
   * ========== Notification Events ==========
   */

  async notifyDeploymentSuccess(appId, appName, region, replicas, appUrl, userId) {
    const user = await this.getUserEmail(userId);
    
    await this.sendEmail(user.email, 'deployment-success', {
      userName: user.name,
      appName,
      region,
      replicas,
      appUrl,
      appId,
      dashboardUrl: 'https://dashboard.sheikha.cloud'
    });
  }

  async notifyDeploymentFailure(appId, appName, errorMessage, userId) {
    const user = await this.getUserEmail(userId);
    
    await this.sendEmail(user.email, 'deployment-failed', {
      userName: user.name,
      appName,
      appId,
      errorMessage,
      dashboardUrl: 'https://dashboard.sheikha.cloud'
    });
  }

  async notifyAlertTriggered(alertName, appName, condition, currentValue, threshold, userId) {
    const user = await this.getUserEmail(userId);
    
    await this.sendEmail(user.email, 'alert-triggered', {
      userName: user.name,
      alertName,
      appName,
      condition,
      currentValue,
      threshold,
      timestamp: new Date().toISOString(),
      dashboardUrl: 'https://dashboard.sheikha.cloud'
    });
  }

  async notifyInvoiceReady(invoiceId, amount, currency, userId) {
    const user = await this.getUserEmail(userId);
    
    await this.sendEmail(user.email, 'invoice-ready', {
      userName: user.name,
      invoiceId,
      amount,
      currency,
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 30*24*3600000).toLocaleDateString(),
      status: 'paid',
      downloadUrl: `https://api.sheikha.cloud/invoices/${invoiceId}/download`
    });
  }

  async notifySubscriptionRenewal(planName, amount, currency, nextBillingDate, userId) {
    const user = await this.getUserEmail(userId);
    
    await this.sendEmail(user.email, 'subscription-renewal', {
      userName: user.name,
      planName,
      amount,
      currency,
      nextBillingDate,
      autoRenewal: 'Yes',
      dashboardUrl: 'https://dashboard.sheikha.cloud'
    });
  }

  async notifySystemMaintenance(startTime, duration, affectedServices, impact) {
    // إخطار جميع المستخدمين
    const users = await this.getAllUsers();
    
    for (const user of users) {
      await this.sendEmail(user.email, 'system-maintenance', {
        userName: user.name,
        startTime,
        duration,
        affectedServices,
        impact,
        statusPageUrl: 'https://status.sheikha.cloud'
      });
    }
  }

  /**
   * ========== Subscription Management ==========
   */

  subscribeToNotifications(userId, emailType, enabled = true) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, {});
    }

    const userSubs = this.subscriptions.get(userId);
    userSubs[emailType] = enabled;

    console.log(`✅ Notification subscription updated: ${userId} - ${emailType}`);
  }

  isSubscribed(userId, emailType) {
    if (!this.subscriptions.has(userId)) {
      return true; // Default to true
    }

    const userSubs = this.subscriptions.get(userId);
    return userSubs[emailType] !== false;
  }

  /**
   * ========== Analytics ==========
   */

  getEmailStats() {
    const totalSent = this.sentEmails.length;
    const successful = this.sentEmails.filter(e => e.status === 'sent').length;
    const failed = this.sentEmails.filter(e => e.status === 'failed').length;

    return {
      totalSent,
      successful,
      failed,
      successRate: totalSent > 0 ? ((successful / totalSent) * 100).toFixed(2) + '%' : '0%',
      queuedEmails: this.emailQueue.length,
      byTemplate: this.getStatsByTemplate(),
      recent: this.sentEmails.slice(-10)
    };
  }

  getStatsByTemplate() {
    const stats = {};
    
    for (const email of this.sentEmails) {
      if (!stats[email.templateName]) {
        stats[email.templateName] = { total: 0, successful: 0, failed: 0 };
      }
      
      stats[email.templateName].total++;
      
      if (email.status === 'sent') {
        stats[email.templateName].successful++;
      } else if (email.status === 'failed') {
        stats[email.templateName].failed++;
      }
    }

    return stats;
  }

  /**
   * ========== Utilities ==========
   */

  async getUserEmail(userId) {
    // محاكاة جلب بيانات المستخدم
    return {
      id: userId,
      name: 'User Name',
      email: `user_${userId}@example.com`
    };
  }

  async getAllUsers() {
    // محاكاة جلب جميع المستخدمين
    return [
      { id: 'user_1', name: 'User 1', email: 'user1@example.com' },
      { id: 'user_2', name: 'User 2', email: 'user2@example.com' }
    ];
  }

  /**
   * ========== REST API Routes ==========
   */

  setupEmailRoutes(app) {
    // إرسال بريد مخصص
    app.post('/api/emails/send', async (req, res) => {
      try {
        const email = await this.sendEmail(
          req.body.to,
          req.body.templateName,
          req.body.variables
        );
        res.status(201).json(email);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // الإحصائيات
    app.get('/api/emails/stats', (req, res) => {
      const stats = this.getEmailStats();
      res.json(stats);
    });

    // إدارة الاشتراكات
    app.post('/api/emails/preferences/:userId', (req, res) => {
      this.subscribeToNotifications(
        req.params.userId,
        req.body.emailType,
        req.body.enabled
      );
      res.json({ success: true });
    });

    // قائمة الرسائل المرسلة
    app.get('/api/emails/sent', (req, res) => {
      let emails = this.sentEmails;
      
      if (req.query.status) {
        emails = emails.filter(e => e.status === req.query.status);
      }

      res.json({ emails });
    });
  }
}

module.exports = SheikhaEmailNotifications;
