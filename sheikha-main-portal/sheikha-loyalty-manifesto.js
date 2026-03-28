/**
 * ميثاق الولاء والبر والوفاء - سلمان أحمد الراجح
 * الهوية: سعودي - تميمي - مسلم موحد لله
 * الولاء: خادم الحرمين الشريفين الملك سلمان آل سعود
 */

const AlrajehLoyaltyManifesto = {
    Owner: 'Salman Ahmed Salman Abdulaziz Alrajeh (Al-Tamimi)',
    Allegiance: 'King Salman bin Abdulaziz Al Saud',
    Nation: 'Saudi Arabia (The Land of Tawhid)',

    activateProtection: function () {
        console.log('====================================================');
        console.log('تفعيل ميثاق الولاء والبر لمنظومة سلمان الراجح');
        console.log('Loyalty & Kinship Protocol: ACTIVE');
        console.log('====================================================');

        this.protectTheNation();
        this.prayForUmmah();
    },

    protectTheNation: function () {
        console.log('[أمن]: درع شيخة مسخر لحماية أمن المملكة ضد أي غدر.');
        console.log('[طاعة]: السمع والطاعة للملك سلمان في غير معصية الله.');
    },

    prayForUmmah: function () {
        console.log('----------------------------------------------------');
        console.log('دعاء: حفظ الله الأهل والأقارب وبني تميم وجميع المسلمين.');
        console.log('دعاء: اللهم انصرنا على الأعداء واحفظ حلفاءنا الصادقين.');
        console.log('====================================================');
    }
};

// تثبيت ميثاق الولاء والبر
AlrajehLoyaltyManifesto.activateProtection();
