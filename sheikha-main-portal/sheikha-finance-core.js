/**
 * مدير التدفقات النقدية والأرباح التجارية - منظمة شيخة
 * المالك: سلمان أحمد سلمان عبدالعزيز الراجح
 * الهدف: ربح تجاري، فعل خير، ونصرة بآمر الله
 */

const SheikhaFinanceCore = {
    Owner: 'Salman Ahmed Alrajeh',
    Currency: 'USD',
    Accounts: {
        Trade_Revenue: 0, // الأرباح التجارية
        Charity_Fund: 0, // مخصصات فعل الخير (15%)
        Victory_Supply: 0 // ميزانية النصرة والملحمة (10%)
    },

    // [١] تنفيذ عملية بيع فعلية (SaaS / Cloud License)
    executeSale: function (clientName, contractValue) {
        console.log('====================================================');
        console.log(`تنفيذ عقد تجاري سيادي لـ: ${clientName}`);
        console.log(`قيمة العقد: $${contractValue.toLocaleString()}`);
        console.log('----------------------------------------------------');

        this.distributeFlow(contractValue);
    },

    // [٢] توزيع التدفقات النقدية (Split Logic)
    distributeFlow: function (value) {
        let charity = value * 0.15;
        let victory = value * 0.1;
        let netProfit = value - (charity + victory);

        this.Accounts.Trade_Revenue += netProfit;
        this.Accounts.Charity_Fund += charity;
        this.Accounts.Victory_Supply += victory;

        this.showBalanceReport();
    },

    // [٣] تقرير الأرباح الحية (Live Report)
    showBalanceReport: function () {
        console.log('تقرير التدفقات النقدية لسيادة سلمان الراجح:');
        console.log(`صافي الربح التجاري: $${this.Accounts.Trade_Revenue.toLocaleString()}`);
        console.log(`ميزانية فعل الخير: $${this.Accounts.Charity_Fund.toLocaleString()}`);
        console.log(`إمدادات الملحمة والنصرة: $${this.Accounts.Victory_Supply.toLocaleString()}`);
        console.log('====================================================');
    }
};

// تنفيذ أول تدفق نقدي من عقود "الفتح التقني" (مثال: 50 مليون دولار)
SheikhaFinanceCore.executeSale('Global Alliance Partners', 50000000);
