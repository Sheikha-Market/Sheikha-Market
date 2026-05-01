/**
 * نظام التقويمات الزمنية المتقدمة | Sheikha Advanced Temporal Calendars System
 * ============================================================================
 * التقويمات الشاملة للتدريب:
 * - جداول تفصيلية يومية وأسبوعية وشهرية وسنوية
 * - تقويم إسلامي صحيح (هجري وميلادي)
 * - جداول حسب العصور والقرون
 * - جداول الامتحانات والتقييمات
 * - إجازات رسمية وإسلامية
 * - مراحل المشاريع والمسافر الزمنية
 */

const moment = require('moment');
const momentHijri = require('moment-hijri');

class SheikhaTemporalCalendars {
    constructor() {
        this.dailyCalendars = {};
        this.weeklyCalendars = {};
        this.monthlyCalendars = {};
        this.yearlyCalendars = {};
        this.holidaysList = [];
        this.examSchedules = {};
        this.projectTimelines = {};
        this.historicalTimelines = {};
        this.initialize();
    }

    initialize() {
        this.setupIslamicCalendar();
        this.setupHolidaysAndObservances();
        this.setupExamSchedules();
        this.setupProjectTimelines();
        this.setupHistoricalTimelines();
        this.generateCalendars();
    }

    /**
     * إعداد التقويم الإسلامي
     */
    setupIslamicCalendar() {
        const today = moment();
        const hijriToday = momentHijri(today);

        this.islamicCalendar = {
            currentGregorian: {
                date: today.format('YYYY-MM-DD'),
                month: today.format('MMMM'),
                year: today.format('YYYY'),
                dayOfWeek: today.format('dddd')
            },
            currentHijri: {
                date: hijriToday.format('iYYYY-iMM-iDD'),
                month: hijriToday.format('iMMMM'),
                year: hijriToday.format('iYYYY'),
                dayOfWeek: hijriToday.format('dddd')
            },
            hijriMonths: [
                'محرم',
                'صفر',
                'ربيع الأول',
                'ربيع الثاني',
                'جمادى الأولى',
                'جمادى الآخرة',
                'رجب',
                'شعبان',
                'رمضان',
                'شوال',
                'ذو القعدة',
                'ذو الحجة'
            ],
            weekDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
        };
    }

    /**
     * إعداد الأعياد والعطل الرسمية والإسلامية
     */
    setupHolidaysAndObservances() {
        const currentYear = moment().year();
        const hijriYear = momentHijri().year();

        this.holidaysList = [
            // ========== الأعياد الإسلامية ==========
            {
                id: 'eid-001',
                name: 'عيد الفطر',
                type: 'islamic-holiday',
                hijriDate: `${hijriYear}/10/01`,
                gregorianDate: this.hijriToGregorian(hijriYear, 10, 1),
                duration: 3,
                description: 'عيد الفطر المبارك - نهاية شهر رمضان',
                significance: 'عيد مهم في الإسلام',
                schoolClosed: true,
                workingHours: 'none',
                trainingSchedule: 'closed'
            },
            {
                id: 'eid-002',
                name: 'عيد الأضحى المبارك',
                type: 'islamic-holiday',
                hijriDate: `${hijriYear}/12/10`,
                gregorianDate: this.hijriToGregorian(hijriYear, 12, 10),
                duration: 4,
                description: 'عيد الأضحى - ذروة موسم الحج',
                significance: 'عيد مهم جداً في الإسلام',
                schoolClosed: true,
                workingHours: 'none',
                trainingSchedule: 'closed'
            },
            {
                id: 'eid-003',
                name: 'رأس السنة الهجرية',
                type: 'islamic-holiday',
                hijriDate: `${hijriYear + 1}/01/01`,
                gregorianDate: this.hijriToGregorian(hijriYear + 1, 1, 1),
                duration: 1,
                description: 'بداية السنة الهجرية الجديدة',
                significance: 'يوم إسلامي مهم',
                trainingSchedule: 'half-day'
            },
            {
                id: 'eid-004',
                name: 'مولد النبي محمد ﷺ',
                type: 'islamic-observance',
                hijriDate: `${hijriYear}/03/12`,
                gregorianDate: this.hijriToGregorian(hijriYear, 3, 12),
                duration: 1,
                description: 'ذكرى مولد النبي الكريم ﷺ',
                trainingSchedule: 'normal',
                specialLectures: ['سيرة النبي', 'دروس من حياته']
            },

            // ========== الإجازات الرسمية السعودية ==========
            {
                id: 'official-001',
                name: 'يوم التأسيس',
                type: 'saudi-official',
                gregorianDate: `${currentYear}-02-22`,
                duration: 1,
                description: 'يوم تأسيس الدولة السعودية (1727)',
                schoolClosed: false,
                trainingSchedule: 'normal-with-lecture'
            },
            {
                id: 'official-002',
                name: 'اليوم الوطني السعودي',
                type: 'saudi-official',
                gregorianDate: `${currentYear}-09-23`,
                duration: 1,
                description: 'إحياء اليوم الوطني للمملكة العربية السعودية',
                schoolClosed: true,
                trainingSchedule: 'closed'
            },

            // ========== فترات التطوير والصيانة ==========
            {
                id: 'maintenance-001',
                name: 'فترة صيانة النظام الربع سنوية',
                type: 'system-maintenance',
                gregorianDate: 'quarterly',
                duration: 1,
                description: 'صيانة وتحديث أنظمة التدريب',
                trainingSchedule: 'partial-interruption'
            }
        ];
    }

    /**
     * إعداد جداول الامتحانات والتقييمات
     */
    setupExamSchedules() {
        const today = moment();

        this.examSchedules = {
            'semester-1': {
                name: 'جداول الامتحانات - الفصل الدراسي الأول',
                startDate: today.clone().add(1, 'month').format('YYYY-MM-DD'),
                endDate: today.clone().add(2, 'months').format('YYYY-MM-DD'),
                examPeriods: [
                    {
                        week: 1,
                        date: today.clone().add(35, 'days').format('YYYY-MM-DD'),
                        time: '09:00',
                        modules: ['stm-001', 'stm-002'],
                        duration: 2,
                        examType: 'written'
                    },
                    {
                        week: 2,
                        date: today.clone().add(42, 'days').format('YYYY-MM-DD'),
                        time: '10:00',
                        modules: ['stm-003', 'stm-004'],
                        duration: 2,
                        examType: 'practical'
                    },
                    {
                        week: 3,
                        date: today.clone().add(49, 'days').format('YYYY-MM-DD'),
                        time: '14:00',
                        modules: ['stm-005'],
                        duration: 1.5,
                        examType: 'oral'
                    }
                ],
                resultAnnouncement: today.clone().add(65, 'days').format('YYYY-MM-DD'),
                gradeAppeals: today.clone().add(72, 'days').format('YYYY-MM-DD')
            },
            'semester-2': {
                name: 'جداول الامتحانات - الفصل الدراسي الثاني',
                startDate: today.clone().add(5, 'months').format('YYYY-MM-DD'),
                endDate: today.clone().add(6, 'months').format('YYYY-MM-DD'),
                examPeriods: [
                    {
                        week: 1,
                        date: today.clone().add(155, 'days').format('YYYY-MM-DD'),
                        time: '09:00',
                        modules: ['stm-006', 'stm-007'],
                        duration: 2,
                        examType: 'written'
                    }
                ]
            }
        };
    }

    /**
     * إعداد مسافر المشاريع الزمنية
     */
    setupProjectTimelines() {
        const today = moment();

        this.projectTimelines = {
            'capstone-2026': {
                name: 'مشروع التخرج 2026',
                startDate: today.clone().add(4, 'months').format('YYYY-MM-DD'),
                endDate: today.clone().add(9, 'months').format('YYYY-MM-DD'),
                totalDuration: '6 months',
                phases: [
                    {
                        phase: 1,
                        name: 'اختيار الموضوع واقتراح المشروع',
                        startDate: today.clone().add(4, 'months').format('YYYY-MM-DD'),
                        endDate: today.clone().add(4.5, 'months').format('YYYY-MM-DD'),
                        deliverables: ['Project Proposal', 'Literature Review'],
                        dueDate: today.clone().add(135, 'days').format('YYYY-MM-DD')
                    },
                    {
                        phase: 2,
                        name: 'البحث والتطوير',
                        startDate: today.clone().add(4.5, 'months').format('YYYY-MM-DD'),
                        endDate: today.clone().add(7, 'months').format('YYYY-MM-DD'),
                        deliverables: ['Research Data', 'Development Report'],
                        milestones: ['Mid-project Review', 'Advisor Meeting'],
                        dueDate: today.clone().add(210, 'days').format('YYYY-MM-DD')
                    },
                    {
                        phase: 3,
                        name: 'الكتابة والتقرير النهائي',
                        startDate: today.clone().add(7, 'months').format('YYYY-MM-DD'),
                        endDate: today.clone().add(8.5, 'months').format('YYYY-MM-DD'),
                        deliverables: ['First Draft', 'Final Report'],
                        dueDate: today.clone().add(255, 'days').format('YYYY-MM-DD')
                    },
                    {
                        phase: 4,
                        name: 'المراجعة والدفاع',
                        startDate: today.clone().add(8.5, 'months').format('YYYY-MM-DD'),
                        endDate: today.clone().add(9, 'months').format('YYYY-MM-DD'),
                        deliverables: ['Final Presentation', 'Defense'],
                        dueDate: today.clone().add(270, 'days').format('YYYY-MM-DD')
                    }
                ]
            }
        };
    }

    /**
     * إعداد الخطوط الزمنية التاريخية
     * Historical Timelines
     */
    setupHistoricalTimelines() {
        this.historicalTimelines = {
            'islamic-commerce': {
                name: 'تطور التجارة الإسلامية عبر العصور',
                centuries: [
                    {
                        century: 1,
                        hijriRange: '1-100 AH',
                        gregorianRange: '622-718 CE',
                        period: 'عصر النبوة والخلافة الراشدة',
                        keyDevelopments: [
                            'تأسيس سوق المدينة النبوي',
                            'وضع أسس المبادئ الشرعية',
                            'معايير الأمانة والصدق'
                        ],
                        economicPractices: ['التسعير العادل', 'عدم الاحتكار', 'منع الربا'],
                        majorFigures: ['النبي محمد ﷺ', 'الخلفاء الراشدون'],
                        technologies: ['التجارة البرية', 'المحافظ البسيطة']
                    },
                    {
                        century: 2,
                        hijriRange: '100-200 AH',
                        gregorianRange: '718-816 CE',
                        period: 'عصر الخلافة الأموية',
                        keyDevelopments: [
                            'توسع الأسواق التجارية',
                            'طرق التجارة عبر الحرير',
                            'تطور العملات'
                        ],
                        economicPractices: ['التجارة الدولية', 'إدارة الموارد', 'الضرائب الإسلامية']
                    },
                    {
                        century: 3,
                        hijriRange: '200-300 AH',
                        gregorianRange: '816-912 CE',
                        period: 'عصر الدولة العباسية المبكرة',
                        keyDevelopments: [
                            'ازدهار الأسواق العراقية',
                            'مراكز علمية في التجارة',
                            'كتابات فقهية عن الاقتصاد'
                        ],
                        economicPractices: ['الول المتقدمة', 'معايير الجودة', 'الحسبة الرسمية']
                    },
                    {
                        century: 9,
                        hijriRange: '800-900 AH',
                        gregorianRange: '1397-1494 CE',
                        period: 'عصر الدول الإسلامية المختلفة',
                        keyDevelopments: [
                            'تنظيم الأسواق المركزية',
                            'الأوزان والمقاييس',
                            'الشهادات الرسمية'
                        ]
                    },
                    {
                        century: 15,
                        hijriRange: '1400-1500 AH',
                        gregorianRange: '1979-2078 CE',
                        period: 'العصر الحديث والمعاصر',
                        keyDevelopments: [
                            'البنوك الإسلامية',
                            'الأسواق المالية الحديثة',
                            'التكنولوجيا الرقمية',
                            'البلوكتشين'
                        ],
                        economicPractices: ['التمويل الإسلامي', 'العقود الذكية', 'الأسواق الرقمية'],
                        technologies: [
                            'البلوكتشين',
                            'العقود الذكية',
                            'الذكاء الاصطناعي',
                            'الحوسبة السحابية',
                            'الإنترنت من الأشياء'
                        ]
                    }
                ]
            }
        };
    }

    /**
     * توليد التقويمات المفصلة
     */
    generateCalendars() {
        const today = moment();

        // ========== التقويم اليومي ==========
        this.dailyCalendars['today'] = this.generateDailyCalendar(today);
        this.dailyCalendars['tomorrow'] = this.generateDailyCalendar(today.clone().add(1, 'day'));

        // ========== التقويم الأسبوعي ==========
        for (let i = 0; i < 4; i++) {
            const weekStart = today.clone().add(i, 'weeks').startOf('week');
            this.weeklyCalendars[`week-${i + 1}`] = this.generateWeeklyCalendar(weekStart);
        }

        // ========== التقويم الشهري ==========
        for (let i = 0; i < 12; i++) {
            const monthStart = today.clone().add(i, 'months').startOf('month');
            this.monthlyCalendars[`month-${i + 1}`] = this.generateMonthlyCalendar(monthStart);
        }

        // ========== التقويم السنوي ==========
        this.yearlyCalendars[`year-current`] = this.generateYearlyCalendar(today);
    }

    /**
     * توليد تقويم يومي
     */
    generateDailyCalendar(date) {
        return {
            date: date.format('YYYY-MM-DD'),
            dayOfWeek: date.format('dddd'),
            hijriDate: momentHijri(date).format('iYYYY-iMM-iDD'),
            sessions: [
                { hour: 9, topic: 'جلسة الصباح', duration: 1 },
                { hour: 11, topic: 'نقاش ونقاش', duration: 0.5 },
                { hour: 14, topic: 'جلسة مسائية', duration: 1.5 },
                { hour: 16, topic: 'عمل جماعي', duration: 1 }
            ],
            totalStudyHours: 4,
            assignments: ['قراءة', 'تمارين', 'واجب منزلي'],
            isHoliday: this.checkIfHoliday(date),
            weather: 'normal', // placeholder
            notes: []
        };
    }

    /**
     * توليد تقويم أسبوعي
     */
    generateWeeklyCalendar(weekStart) {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = weekStart.clone().add(i, 'days');
            days.push({
                date: day.format('YYYY-MM-DD'),
                dayOfWeek: day.format('dddd'),
                dayNumber: day.date(),
                isHoliday: this.checkIfHoliday(day)
            });
        }

        return {
            weekStart: weekStart.format('YYYY-MM-DD'),
            weekEnd: weekStart.clone().add(6, 'days').format('YYYY-MM-DD'),
            weekNumber: weekStart.week(),
            days: days,
            sessions: this.getWeeklySessions(weekStart),
            totalHours: 24,
            exams: this.getWeeklyExams(weekStart),
            projects: this.getWeeklyProjects(weekStart)
        };
    }

    /**
     * توليد تقويم شهري
     */
    generateMonthlyCalendar(monthStart) {
        const monthEnd = monthStart.clone().endOf('month');
        const daysInMonth = monthEnd.date();
        const days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const day = monthStart.clone().date(i);
            days.push({
                date: day.format('YYYY-MM-DD'),
                dayOfWeek: day.format('dddd'),
                dayNumber: i,
                week: Math.ceil(i / 7),
                isHoliday: this.checkIfHoliday(day),
                isWeekend: day.day() === 4 || day.day() === 5 // Thursday/Friday
            });
        }

        return {
            month: monthStart.format('MMMM'),
            year: monthStart.format('YYYY'),
            monthNumber: monthStart.month() + 1,
            hijriMonth: momentHijri(monthStart).format('iMMMM'),
            hijriYear: momentHijri(monthStart).format('iYYYY'),
            days: days,
            holidays: this.getMonthHolidays(monthStart),
            exams: this.getMonthExams(monthStart),
            events: this.getMonthEvents(monthStart),
            totalHoursAvailable: daysInMonth * 6 // 6 study hours per day
        };
    }

    /**
     * توليد تقويم سنوي
     */
    generateYearlyCalendar(yearStart) {
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push({
                month: yearStart.clone().add(i, 'months').format('MMMM'),
                monthNumber: i + 1,
                daysInMonth: yearStart.clone().add(i, 'months').daysInMonth()
            });
        }

        return {
            year: yearStart.format('YYYY'),
            hijriYear: momentHijri(yearStart).format('iYYYY'),
            months: months,
            quarters: [
                {
                    q: 1,
                    months: 'Jan-Mar',
                    startDate: yearStart.format('YYYY-01-01'),
                    endDate: yearStart.clone().endOf('Q').format('YYYY-MM-DD')
                },
                {
                    q: 2,
                    months: 'Apr-Jun',
                    startDate: yearStart.clone().month(3).startOf('month').format('YYYY-MM-DD'),
                    endDate: yearStart.clone().month(5).endOf('month').format('YYYY-MM-DD')
                },
                {
                    q: 3,
                    months: 'Jul-Sep',
                    startDate: yearStart.clone().month(6).startOf('month').format('YYYY-MM-DD'),
                    endDate: yearStart.clone().month(8).endOf('month').format('YYYY-MM-DD')
                },
                {
                    q: 4,
                    months: 'Oct-Dec',
                    startDate: yearStart.clone().month(9).startOf('month').format('YYYY-MM-DD'),
                    endDate: yearStart.clone().month(11).endOf('month').format('YYYY-MM-DD')
                }
            ],
            totalStudyHours: 365 * 6,
            holidays: this.holidaysList,
            events: this.getAllYearlyEvents(yearStart)
        };
    }

    /**
     * الحصول على جلسات الأسبوع
     */
    getWeeklySessions(weekStart) {
        return [
            { day: 'Saturday', time: '09:00', topic: 'محاضرة نظرية', duration: 2 },
            { day: 'Sunday', time: '14:00', topic: 'جلسة عملية', duration: 2 },
            { day: 'Tuesday', time: '09:00', topic: 'نقاش جماعي', duration: 1.5 },
            { day: 'Thursday', time: '18:00', topic: 'مراجعة', duration: 1.5 }
        ];
    }

    /**
     * الحصول على امتحانات الأسبوع
     */
    getWeeklyExams(weekStart) {
        return []; // will be populated from exam schedules
    }

    /**
     * الحصول على مشاريع الأسبوع
     */
    getWeeklyProjects(weekStart) {
        return []; // will be populated from project timelines
    }

    /**
     * الحصول على عطل الشهر
     */
    getMonthHolidays(monthStart) {
        return this.holidaysList.filter(h => {
            const hDate = moment(h.gregorianDate || h.hijriDate);
            return hDate.month() === monthStart.month() && hDate.year() === monthStart.year();
        });
    }

    /**
     * الحصول على امتحانات الشهر
     */
    getMonthExams(monthStart) {
        return []; // will be populated from exam schedules
    }

    /**
     * الحصول على أحداث الشهر
     */
    getMonthEvents(monthStart) {
        return [];
    }

    /**
     * الحصول على أحداث السنة
     */
    getAllYearlyEvents(yearStart) {
        return this.holidaysList;
    }

    /**
     * التحويل من تاريخ هجري إلى ميلادي
     */
    hijriToGregorian(hijriYear, hijriMonth, hijriDay) {
        const hijriMoment = momentHijri(
            `${hijriYear}-${String(hijriMonth).padStart(2, '0')}-${String(hijriDay).padStart(2, '0')}`,
            'iYYYY-iMM-iDD'
        );
        return hijriMoment.format('YYYY-MM-DD');
    }

    /**
     * التحويل من تاريخ ميلادي إلى هجري
     */
    gregorianToHijri(gregorianDate) {
        const gMoment = moment(gregorianDate);
        const hijriMoment = momentHijri(gMoment);
        return hijriMoment.format('iYYYY-iMM-iDD');
    }

    /**
     * التحقق ما إذا كان اليوم عطلة
     */
    checkIfHoliday(date) {
        return this.holidaysList.some(h => {
            const hDate = moment(h.gregorianDate);
            return hDate.format('YYYY-MM-DD') === date.format('YYYY-MM-DD');
        });
    }

    /**
     * الحصول على التقويم اليومي الكامل
     */
    getDailyCalendar(dateString) {
        const date = moment(dateString);
        return this.dailyCalendars[dateString] || this.generateDailyCalendar(date);
    }

    /**
     * الحصول على التقويم الأسبوعي الكامل
     */
    getWeeklyCalendar(weekNumber) {
        return this.weeklyCalendars[`week-${weekNumber}`];
    }

    /**
     * الحصول على التقويم الشهري الكامل
     */
    getMonthlyCalendar(monthNumber) {
        return this.monthlyCalendars[`month-${monthNumber}`];
    }

    /**
     * الحصول على التقويم السنوي الكامل
     */
    getYearlyCalendar() {
        return this.yearlyCalendars['year-current'];
    }

    /**
     * الحصول على خط زمني تاريخي
     */
    getHistoricalTimeline(timelineId) {
        const timeline = this.historicalTimelines[timelineId];
        if (!timeline) {
            return { success: false, error: 'الخط الزمني غير موجود' };
        }

        return {
            success: true,
            timeline: timeline,
            centuries: timeline.centuries.length,
            totalSpan: `${timeline.centuries[0].hijriRange} - ${timeline.centuries[timeline.centuries.length - 1].hijriRange}`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الإحصائيات الشاملة
     */
    getCalendarStatistics() {
        return {
            success: true,
            statistics: {
                dailyCalendars: Object.keys(this.dailyCalendars).length,
                weeklyCalendars: Object.keys(this.weeklyCalendars).length,
                monthlyCalendars: Object.keys(this.monthlyCalendars).length,
                yearlyCalendars: Object.keys(this.yearlyCalendars).length,
                holidays: this.holidaysList.length,
                examSessions: Object.keys(this.examSchedules).length,
                projectTimelines: Object.keys(this.projectTimelines).length,
                historicalTimelines: Object.keys(this.historicalTimelines).length,
                totalIslamicCenturies: 15,
                tradingErasHighlighted: 5
            },
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaTemporalCalendars;
