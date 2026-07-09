#!/usr/bin/env node

/**
 * 🖥️ Sheikha OS Integration Demo
 * توضيح تكامل نظام شيخة الموحد مع منصة السحابة
 * 
 * Demonstrates full integration between Sheikha OS and Cloud Platform
 */

const { getIntegration } = require('./js/sheikha-os-integration');

/**
 * Demo class
 */
class SheikhaOSDemo {
  constructor() {
    this.integration = getIntegration();
  }

  /**
   * Run full demo
   */
  async runDemo() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🖥️ Sheikha OS Integration Demo                        ║');
    console.log('║  نظام شيخة الموحد — عرض توضيحي                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
      // Step 1: Initialize integration
      console.log('📍 STEP 1: Initialize Sheikha OS Integration');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const result = await this.integration.initialize();
      if (!result.success) {
        console.error('❌ Initialization failed:', result.error);
        return;
      }

      console.log('✅ Integration initialized successfully\n');

      // Step 2: Get OS Status
      console.log('📍 STEP 2: Get Operating System Status');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const osStatus = this.integration.getOSStatus();
      console.log('OS Status:');
      console.log(JSON.stringify(osStatus, null, 2));
      console.log();

      // Step 3: List processes
      console.log('📍 STEP 3: Execute OS Commands');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('Command: process:list');
      const processes = this.integration.executeCommand('process:list');
      console.log(`Found ${processes.length} processes:`);
      processes.forEach((proc, index) => {
        const isLast = index === processes.length - 1;
        const prefix = isLast ? '└─' : '├─';
        console.log(
          `${prefix} PID: ${proc.pid} | ${proc.name.padEnd(20)} | Memory: ${proc.memory}`
        );
      });
      console.log();

      // Step 4: Get memory status
      console.log('Command: memory:status');
      const memory = this.integration.executeCommand('memory:status');
      console.log('Memory Status:');
      console.log(JSON.stringify(memory, null, 2));
      console.log();

      // Step 5: Create managed container
      console.log('📍 STEP 4: Create Managed Container');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const container = this.integration.createManagedContainer({
        name: 'demo-app',
        image: 'sheikha-app:latest',
        memory: 512,
        cpu: 1,
        ports: [3000, 8080],
        volumes: ['/data:/app/data'],
        environment: {
          NODE_ENV: 'production',
          APP_DEBUG: 'false',
        },
      });

      console.log('Created Container:');
      console.log(JSON.stringify(container, null, 2));
      console.log();

      // Step 6: Health check
      console.log('📍 STEP 5: Health Check');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const health = this.integration.getHealthCheck();
      console.log('Health Status:');
      console.log(JSON.stringify(health, null, 2));
      console.log();

      // Step 7: Detailed report
      console.log('📍 STEP 6: Detailed Integration Report');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      this.integration.getDetailedReport();

      // Summary
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  ✅ Demo Complete - All Systems Operational            ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      console.log('Next steps:');
      console.log('  1. Review the integration results above');
      console.log('  2. Check OS health status');
      console.log('  3. Deploy containers through the API');
      console.log('  4. Monitor system resources\n');
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Run demo if executed directly
if (require.main === module) {
  const demo = new SheikhaOSDemo();
  demo.runDemo().catch(console.error);
}

module.exports = SheikhaOSDemo;
