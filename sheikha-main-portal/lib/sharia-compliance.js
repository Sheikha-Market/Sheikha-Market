/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ☪️ محرك التحقق الشرعي - Sharia Compliance Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  بسم الله الرحمن الرحيم
 *  "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" - البقرة: 275
 * 
 *  هذا المحرك مسؤول عن التحقق من توافق جميع المعاملات مع أحكام الشريعة الإسلامية
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── الأدلة الشرعية من القرآن الكريم ─────────────────────────────────────────────
const QURAN_EVIDENCE = {
    البيع: {
        آية: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا",
        سورة: "البقرة",
        رقم: 275,
        الحكم: "إباحة البيع وتحريم الربا"
    },
    العقود: {
        آية: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ",
        سورة: "المائدة",
        رقم: 1,
        الحكم: "وجوب الوفاء بالعقود"
    },
    التوثيق: {
        آية: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ",
        سورة: "البقرة",
        رقم: 282,
        الحكم: "استحباب التوثيق في المعاملات"
    },
    الأمانة: {
        آية: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا",
        سورة: "النساء",
        رقم: 58,
        الحكم: "وجوب أداء الأمانات"
    },
    العدل: {
        آية: "وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ",
        سورة: "الرحمن",
        رقم: 9,
        الحكم: "وجوب العدل في القياس"
    },
    التراضي: {
        آية: "إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ",
        سورة: "النساء",
        رقم: 29,
        الحكم: "اشتراط التراضي في البيع"
    }
};

// ─── الأدلة من السنة النبوية ─────────────────────────────────────────────────────
const HADITH_EVIDENCE = {
    الصدق: {
        حديث: "التَّاجِرُ الصَّدُوقُ الْأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
        الراوي: "الترمذي",
        الحكم: "فضل الصدق في التجارة"
    },
    البيان: {
        حديث: "الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا، فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا فِي بَيْعِهِمَا، وَإِنْ كَذَبَا وَكَتَمَا مُحِقَتْ بَرَكَةُ بَيْعِهِمَا",
        الراوي: "البخاري ومسلم",
        الحكم: "وجوب البيان وتحريم الكتمان"
    },
    الغش: {
        حديث: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا",
        الراوي: "مسلم",
        الحكم: "تحريم الغش"
    },
    الإتقان: {
        حديث: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
        الراوي: "الطبراني",
        الحكم: "استحباب الإتقان"
    },
    الاحتكار: {
        حديث: "لَا يَحْتَكِرُ إِلَّا خَاطِئٌ",
        الراوي: "مسلم",
        الحكم: "تحريم الاحتكار"
    },
    النجش: {
        حديث: "لَا تَنَاجَشُوا",
        الراوي: "البخاري ومسلم",
        الحكم: "تحريم النجش"
    },
    التسامح: {
        حديث: "رَحِمَ اللَّهُ رَجُلًا سَمْحًا إِذَا بَاعَ، وَإِذَا اشْتَرَى، وَإِذَا اقْتَضَى",
        الراوي: "البخاري",
        الحكم: "استحباب السماحة في البيع"
    }
};

// ─── قواعد التحقق الشرعي ─────────────────────────────────────────────────────────
const SHARIA_RULES = {
    // قواعد الربا
    riba: {
        id: 'RIBA_001',
        name: 'تحريم الربا',
        nameEn: 'Prohibition of Riba (Interest)',
        severity: 'CRITICAL',
        category: 'مالي',
        evidence: QURAN_EVIDENCE.البيع,
        checks: [
            { 
                type: 'NO_INTEREST', 
                description: 'لا فائدة على التأخير',
                descriptionEn: 'No interest on late payment'
            },
            { 
                type: 'NO_RIBA_FADL', 
                description: 'لا ربا الفضل في المعادن الربوية',
                descriptionEn: 'No Riba al-Fadl in ribawi metals'
            },
            { 
                type: 'NO_RIBA_NASIAH', 
                description: 'لا ربا النسيئة',
                descriptionEn: 'No Riba al-Nasiah'
            }
        ]
    },
    
    // قواعد الغرر
    gharar: {
        id: 'GHARAR_001',
        name: 'منع الغرر الفاحش',
        nameEn: 'Prevention of Excessive Gharar',
        severity: 'HIGH',
        category: 'عقدي',
        evidence: {
            حديث: "نهى النبي ﷺ عن بيع الغرر",
            الراوي: "مسلم"
        },
        checks: [
            { 
                type: 'CLEAR_DESCRIPTION', 
                description: 'وصف واضح للمنتج',
                minLength: 50
            },
            { 
                type: 'KNOWN_PRICE', 
                description: 'سعر معلوم ومحدد'
            },
            { 
                type: 'DELIVERABLE', 
                description: 'قابل للتسليم'
            },
            { 
                type: 'EXISTING_ITEM', 
                description: 'المبيع موجود وقت العقد'
            }
        ]
    },
    
    // قواعد الغش
    ghish: {
        id: 'GHISH_001',
        name: 'تحريم الغش',
        nameEn: 'Prohibition of Fraud',
        severity: 'CRITICAL',
        category: 'أخلاقي',
        evidence: HADITH_EVIDENCE.الغش,
        checks: [
            { 
                type: 'TRUE_SPECS', 
                description: 'مواصفات حقيقية ودقيقة'
            },
            { 
                type: 'NO_DEFECT_HIDING', 
                description: 'لا إخفاء للعيوب'
            },
            { 
                type: 'ACCURATE_WEIGHT', 
                description: 'وزن دقيق ومطابق',
                tolerance: 0.01 // 1%
            },
            { 
                type: 'GENUINE_IMAGES', 
                description: 'صور حقيقية للمنتج'
            }
        ]
    },
    
    // قواعد الاحتكار
    ihtikar: {
        id: 'IHTIKAR_001',
        name: 'منع الاحتكار',
        nameEn: 'Prevention of Monopoly',
        severity: 'HIGH',
        category: 'سوقي',
        evidence: HADITH_EVIDENCE.الاحتكار,
        checks: [
            { 
                type: 'NO_HOARDING', 
                description: 'لا تخزين للمضاربة'
            },
            { 
                type: 'FAIR_SUPPLY', 
                description: 'توزيع عادل'
            },
            { 
                type: 'MARKET_PRICE', 
                description: 'سعر السوق العادل'
            }
        ]
    },
    
    // قواعد التراضي
    taradi: {
        id: 'TARADI_001',
        name: 'اشتراط التراضي',
        nameEn: 'Requirement of Mutual Consent',
        severity: 'HIGH',
        category: 'عقدي',
        evidence: QURAN_EVIDENCE.التراضي,
        checks: [
            { 
                type: 'EXPLICIT_CONSENT', 
                description: 'موافقة صريحة من الطرفين'
            },
            { 
                type: 'NO_COERCION', 
                description: 'لا إكراه في البيع'
            },
            { 
                type: 'CLEAR_TERMS', 
                description: 'شروط واضحة ومفهومة'
            }
        ]
    },
    
    // قواعد النجش
    najsh: {
        id: 'NAJSH_001',
        name: 'تحريم النجش',
        nameEn: 'Prohibition of Najsh (Fake Bidding)',
        severity: 'HIGH',
        category: 'سوقي',
        evidence: HADITH_EVIDENCE.النجش,
        checks: [
            { 
                type: 'GENUINE_BIDDING', 
                description: 'عطاءات حقيقية بقصد الشراء'
            },
            { 
                type: 'NO_PRICE_MANIPULATION', 
                description: 'لا تلاعب بالأسعار'
            }
        ]
    }
};

// ─── المعادن الربوية ─────────────────────────────────────────────────────────────
const RIBAWI_METALS = ['gold', 'silver', 'ذهب', 'فضة'];

// ─── فئة محرك التحقق الشرعي ─────────────────────────────────────────────────────
class ShariaComplianceEngine {
    constructor() {
        this.rules = SHARIA_RULES;
        this.quranEvidence = QURAN_EVIDENCE;
        this.hadithEvidence = HADITH_EVIDENCE;
        this.auditLog = [];
    }
    
    /**
     * التحقق الشامل من المعاملة
     * @param {Object} transaction - المعاملة للتحقق
     * @returns {Object} نتيجة التحقق
     */
    async validateTransaction(transaction) {
        const result = {
            transactionId: transaction.id,
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            checks: [],
            overallScore: 100,
            fatwa: null,
            recommendations: []
        };
        
        // 1. فحص الربا (CRITICAL)
        const ribaCheck = this.checkRiba(transaction);
        result.checks.push(ribaCheck);
        if (!ribaCheck.passed) {
            result.status = 'REJECTED';
            result.overallScore = 0;
            result.recommendations.push({
                priority: 'عاجل',
                action: 'إزالة أي شكل من أشكال الربا من المعاملة'
            });
            return this.finalizeResult(result);
        }
        
        // 2. فحص الغرر
        const ghararCheck = this.checkGharar(transaction);
        result.checks.push(ghararCheck);
        if (!ghararCheck.passed && ghararCheck.severity === 'CRITICAL') {
            result.status = 'REJECTED';
            result.overallScore = 0;
            return this.finalizeResult(result);
        }
        
        // 3. فحص الغش (CRITICAL)
        const ghishCheck = this.checkGhish(transaction);
        result.checks.push(ghishCheck);
        if (!ghishCheck.passed) {
            result.status = 'REJECTED';
            result.overallScore = 0;
            result.recommendations.push({
                priority: 'عاجل',
                action: 'تصحيح المعلومات غير الدقيقة والإفصاح عن العيوب'
            });
            return this.finalizeResult(result);
        }
        
        // 4. فحص الاحتكار
        const ihtikarCheck = this.checkIhtikar(transaction);
        result.checks.push(ihtikarCheck);
        if (!ihtikarCheck.passed) {
            result.recommendations.push({
                priority: 'مهم',
                action: 'مراجعة كمية الشراء لتجنب الاحتكار'
            });
        }
        
        // 5. فحص التراضي
        const taradiCheck = this.checkTaradi(transaction);
        result.checks.push(taradiCheck);
        if (!taradiCheck.passed) {
            result.recommendations.push({
                priority: 'مهم',
                action: 'الحصول على موافقة صريحة من جميع الأطراف'
            });
        }
        
        // 6. فحص النجش (للمزادات)
        if (transaction.type === 'auction' || transaction.type === 'مزاد') {
            const najshCheck = this.checkNajsh(transaction);
            result.checks.push(najshCheck);
        }
        
        // حساب النتيجة النهائية
        result.overallScore = this.calculateScore(result.checks);
        result.status = this.determineStatus(result.overallScore);
        
        return this.finalizeResult(result);
    }
    
    /**
     * فحص الربا
     */
    checkRiba(transaction) {
        const check = {
            rule: this.rules.riba,
            passed: true,
            issues: [],
            suggestions: []
        };
        
        // فحص الفوائد
        if (transaction.interest && transaction.interest > 0) {
            check.passed = false;
            check.issues.push({
                type: 'INTEREST_DETECTED',
                message: 'تم اكتشاف فائدة ربوية',
                value: transaction.interest,
                evidence: this.rules.riba.evidence
            });
            check.suggestions.push('إزالة الفائدة واستبدالها برسوم خدمة ثابتة إن لزم');
        }
        
        // فحص غرامات التأخير
        if (transaction.latePenalty && transaction.latePenalty.type === 'percentage') {
            check.passed = false;
            check.issues.push({
                type: 'LATE_PENALTY_INTEREST',
                message: 'غرامة التأخير بنسبة مئوية تُعد ربا',
                value: transaction.latePenalty.rate
            });
            check.suggestions.push('استبدال غرامة النسبة بمبلغ ثابت أو التبرع للجهات الخيرية');
        }
        
        // فحص ربا الفضل في المعادن الربوية (الذهب والفضة)
        if (this.isRibawiMetal(transaction.product)) {
            // إذا كان التبادل بنفس المعدن
            if (transaction.payment?.type && 
                this.isSameRibawiMetal(transaction.product.type, transaction.payment.type)) {
                // يجب أن يكون الوزن متساوياً ويداً بيد
                if (transaction.product.weight !== transaction.payment.weight) {
                    check.passed = false;
                    check.issues.push({
                        type: 'RIBA_FADL',
                        message: 'ربا الفضل: تبادل الذهب بالذهب أو الفضة بالفضة بأوزان مختلفة',
                        productWeight: transaction.product.weight,
                        paymentWeight: transaction.payment.weight
                    });
                }
                
                if (transaction.deferredPayment || transaction.deferredDelivery) {
                    check.passed = false;
                    check.issues.push({
                        type: 'RIBA_NASIAH',
                        message: 'ربا النسيئة: تبادل المعادن الربوية يجب أن يكون يداً بيد'
                    });
                }
            }
        }
        
        return check;
    }
    
    /**
     * فحص الغرر
     */
    checkGharar(transaction) {
        const check = {
            rule: this.rules.gharar,
            passed: true,
            severity: 'HIGH',
            issues: [],
            suggestions: []
        };
        
        // فحص وصف المنتج
        const minDescLength = this.rules.gharar.checks.find(c => c.type === 'CLEAR_DESCRIPTION')?.minLength || 50;
        if (!transaction.product?.description || 
            transaction.product.description.length < minDescLength) {
            check.passed = false;
            check.issues.push({
                type: 'INSUFFICIENT_DESCRIPTION',
                message: `وصف المنتج غير كافٍ (المطلوب ${minDescLength} حرف على الأقل)`,
                currentLength: transaction.product?.description?.length || 0
            });
            check.suggestions.push('إضافة وصف تفصيلي يشمل النوع والجودة والمواصفات');
        }
        
        // فحص وضوح السعر
        if (!transaction.price || transaction.price <= 0) {
            check.passed = false;
            check.severity = 'CRITICAL';
            check.issues.push({
                type: 'UNKNOWN_PRICE',
                message: 'السعر غير محدد أو غير صالح'
            });
        }
        
        // فحص وجود السلعة
        if (transaction.product?.status === 'not_available' || 
            transaction.product?.exists === false) {
            check.passed = false;
            check.issues.push({
                type: 'NON_EXISTENT_ITEM',
                message: 'المبيع غير موجود حالياً'
            });
            check.suggestions.push('التأكد من توفر السلعة قبل البيع');
        }
        
        // فحص القدرة على التسليم
        if (!transaction.deliveryDate && !transaction.immediateDelivery) {
            check.issues.push({
                type: 'NO_DELIVERY_DATE',
                message: 'موعد التسليم غير محدد'
            });
            check.suggestions.push('تحديد موعد تسليم واضح');
        }
        
        // فحص المواصفات
        if (!transaction.product?.specifications || 
            Object.keys(transaction.product.specifications).length === 0) {
            check.issues.push({
                type: 'NO_SPECIFICATIONS',
                message: 'لا توجد مواصفات تفصيلية'
            });
            check.suggestions.push('إضافة المواصفات الفنية (الوزن، النقاء، الأبعاد...)');
        }
        
        return check;
    }
    
    /**
     * فحص الغش
     */
    checkGhish(transaction) {
        const check = {
            rule: this.rules.ghish,
            passed: true,
            issues: [],
            suggestions: []
        };
        
        // فحص دقة الوزن
        if (transaction.declaredWeight && transaction.actualWeight) {
            const tolerance = this.rules.ghish.checks.find(c => c.type === 'ACCURATE_WEIGHT')?.tolerance || 0.01;
            const difference = Math.abs(transaction.declaredWeight - transaction.actualWeight);
            const differencePercentage = difference / transaction.declaredWeight;
            
            if (differencePercentage > tolerance) {
                check.passed = false;
                check.issues.push({
                    type: 'WEIGHT_MISMATCH',
                    message: `فرق الوزن (${(differencePercentage * 100).toFixed(2)}%) أكبر من المسموح (${tolerance * 100}%)`,
                    declared: transaction.declaredWeight,
                    actual: transaction.actualWeight,
                    difference: difference
                });
            }
        }
        
        // فحص ذكر العيوب
        if (transaction.product?.hasDefects && !transaction.product?.defectsDisclosed) {
            check.passed = false;
            check.issues.push({
                type: 'HIDDEN_DEFECTS',
                message: 'وجود عيوب غير مُفصح عنها',
                evidence: this.hadithEvidence.البيان
            });
            check.suggestions.push('يجب الإفصاح الكامل عن جميع العيوب المعروفة');
        }
        
        // فحص صحة المواصفات
        if (transaction.product?.verifiedSpecs === false) {
            check.passed = false;
            check.issues.push({
                type: 'UNVERIFIED_SPECS',
                message: 'المواصفات غير موثقة أو غير مؤكدة'
            });
            check.suggestions.push('الحصول على شهادة فحص من جهة معتمدة');
        }
        
        // فحص النقاء للمعادن الثمينة
        if (this.isPreciousMetal(transaction.product?.type)) {
            if (!transaction.product?.purity || !transaction.product?.purityCertificate) {
                check.issues.push({
                    type: 'NO_PURITY_CERTIFICATE',
                    message: 'لا توجد شهادة نقاء للمعدن الثمين'
                });
                check.suggestions.push('الحصول على شهادة نقاء من مختبر معتمد');
            }
        }
        
        return check;
    }
    
    /**
     * فحص الاحتكار
     */
    checkIhtikar(transaction) {
        const check = {
            rule: this.rules.ihtikar,
            passed: true,
            issues: [],
            suggestions: []
        };
        
        // فحص كمية الشراء
        if (transaction.quantity && transaction.product?.maxPurchaseLimit) {
            if (transaction.quantity > transaction.product.maxPurchaseLimit) {
                check.passed = false;
                check.issues.push({
                    type: 'EXCEEDS_PURCHASE_LIMIT',
                    message: `الكمية (${transaction.quantity}) تتجاوز الحد المسموح (${transaction.product.maxPurchaseLimit})`,
                    evidence: this.hadithEvidence.الاحتكار
                });
                check.suggestions.push('تقليل الكمية أو تقسيم الطلب على فترات');
            }
        }
        
        // فحص نسبة السيطرة على السوق
        if (transaction.buyer?.marketShare && transaction.buyer.marketShare > 0.30) {
            check.issues.push({
                type: 'HIGH_MARKET_SHARE',
                message: `نسبة السيطرة على السوق (${(transaction.buyer.marketShare * 100).toFixed(1)}%) مرتفعة`,
                warning: 'قد يؤدي إلى احتكار'
            });
        }
        
        // فحص التخزين للمضاربة
        if (transaction.purpose === 'speculation' || transaction.purpose === 'مضاربة') {
            check.passed = false;
            check.issues.push({
                type: 'SPECULATION_DETECTED',
                message: 'الشراء بغرض المضاربة والتخزين'
            });
        }
        
        return check;
    }
    
    /**
     * فحص التراضي
     */
    checkTaradi(transaction) {
        const check = {
            rule: this.rules.taradi,
            passed: true,
            issues: [],
            suggestions: []
        };
        
        // فحص موافقة البائع
        if (!transaction.sellerConsent) {
            check.passed = false;
            check.issues.push({
                type: 'NO_SELLER_CONSENT',
                message: 'لم يتم الحصول على موافقة البائع'
            });
        }
        
        // فحص موافقة المشتري
        if (!transaction.buyerConsent) {
            check.passed = false;
            check.issues.push({
                type: 'NO_BUYER_CONSENT',
                message: 'لم يتم الحصول على موافقة المشتري'
            });
        }
        
        // فحص قراءة الشروط
        if (!transaction.termsAccepted) {
            check.issues.push({
                type: 'TERMS_NOT_ACCEPTED',
                message: 'لم يتم قبول الشروط والأحكام'
            });
        }
        
        // فحص وضوح الشروط
        if (transaction.terms && transaction.terms.language !== 'ar' && !transaction.terms.arabicVersion) {
            check.issues.push({
                type: 'NO_ARABIC_TERMS',
                message: 'الشروط غير متوفرة باللغة العربية'
            });
            check.suggestions.push('توفير نسخة عربية واضحة من الشروط');
        }
        
        return check;
    }
    
    /**
     * فحص النجش (للمزادات)
     */
    checkNajsh(transaction) {
        const check = {
            rule: this.rules.najsh,
            passed: true,
            issues: [],
            suggestions: []
        };
        
        // فحص العطاءات المشبوهة
        if (transaction.bids) {
            const suspiciousBids = transaction.bids.filter(bid => {
                return bid.withdrawnImmediately || 
                       bid.sameIPAsSeller ||
                       bid.bidderHasNoPurchaseHistory;
            });
            
            if (suspiciousBids.length > 0) {
                check.issues.push({
                    type: 'SUSPICIOUS_BIDS',
                    message: `${suspiciousBids.length} عطاء/عطاءات مشبوهة`,
                    warning: 'قد تكون محاولة نجش'
                });
            }
        }
        
        // فحص ارتفاع السعر غير الطبيعي
        if (transaction.startingPrice && transaction.currentPrice) {
            const priceIncrease = (transaction.currentPrice - transaction.startingPrice) / transaction.startingPrice;
            if (priceIncrease > 5) { // أكثر من 500% زيادة
                check.issues.push({
                    type: 'ABNORMAL_PRICE_INCREASE',
                    message: `زيادة السعر (${(priceIncrease * 100).toFixed(0)}%) غير طبيعية`,
                    warning: 'قد يكون هناك تلاعب بالأسعار'
                });
            }
        }
        
        return check;
    }
    
    /**
     * التحقق إذا كان المعدن من المعادن الربوية
     */
    isRibawiMetal(product) {
        if (!product?.type) return false;
        return RIBAWI_METALS.includes(product.type.toLowerCase());
    }
    
    /**
     * التحقق إذا كان المعدنان من نفس النوع الربوي
     */
    isSameRibawiMetal(type1, type2) {
        const goldTypes = ['gold', 'ذهب'];
        const silverTypes = ['silver', 'فضة'];
        
        const t1Lower = type1?.toLowerCase();
        const t2Lower = type2?.toLowerCase();
        
        return (goldTypes.includes(t1Lower) && goldTypes.includes(t2Lower)) ||
               (silverTypes.includes(t1Lower) && silverTypes.includes(t2Lower));
    }
    
    /**
     * التحقق إذا كان المعدن ثميناً
     */
    isPreciousMetal(type) {
        const preciousMetals = ['gold', 'silver', 'platinum', 'palladium', 'ذهب', 'فضة', 'بلاتين', 'بالاديوم'];
        return preciousMetals.includes(type?.toLowerCase());
    }
    
    /**
     * حساب نتيجة الامتثال
     */
    calculateScore(checks) {
        let score = 100;
        
        for (const check of checks) {
            if (!check.passed) {
                switch (check.rule.severity) {
                    case 'CRITICAL':
                        score -= 50;
                        break;
                    case 'HIGH':
                        score -= 25;
                        break;
                    case 'MEDIUM':
                        score -= 15;
                        break;
                    case 'LOW':
                        score -= 5;
                        break;
                }
            } else if (check.issues?.length > 0) {
                // خصم بسيط للملاحظات غير المانعة
                score -= check.issues.length * 2;
            }
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * تحديد الحالة بناءً على النتيجة
     */
    determineStatus(score) {
        if (score >= 90) return 'APPROVED';
        if (score >= 70) return 'APPROVED_WITH_NOTES';
        if (score >= 50) return 'NEEDS_REVIEW';
        return 'REJECTED';
    }
    
    /**
     * إنهاء النتيجة وإضافة الفتوى
     */
    finalizeResult(result) {
        // إضافة الفتوى
        result.fatwa = this.generateFatwa(result);
        
        // إضافة الشارة
        result.badge = this.determineBadge(result.overallScore);
        
        // تسجيل في سجل التدقيق
        this.auditLog.push({
            ...result,
            loggedAt: new Date().toISOString()
        });
        
        return result;
    }
    
    /**
     * توليد الفتوى
     */
    generateFatwa(result) {
        switch (result.status) {
            case 'APPROVED':
                return {
                    ruling: 'جائز',
                    rulingEn: 'Permissible (Halal)',
                    confidence: 'عالية',
                    note: 'المعاملة متوافقة مع أحكام الشريعة الإسلامية',
                    evidence: QURAN_EVIDENCE.البيع,
                    dua: 'بارك الله في تجارتكم'
                };
            
            case 'APPROVED_WITH_NOTES':
                return {
                    ruling: 'جائز مع ملاحظات',
                    rulingEn: 'Permissible with Notes',
                    confidence: 'متوسطة',
                    note: 'المعاملة جائزة مع مراعاة الملاحظات المذكورة',
                    notes: result.checks.filter(c => c.issues?.length > 0).flatMap(c => c.issues.map(i => i.message))
                };
            
            case 'NEEDS_REVIEW':
                return {
                    ruling: 'يحتاج مراجعة',
                    rulingEn: 'Requires Sharia Review',
                    confidence: 'متوسطة',
                    note: 'المعاملة تحتاج مراجعة من الهيئة الشرعية',
                    issues: result.checks.filter(c => !c.passed).map(c => c.rule.name),
                    referTo: 'الهيئة الشرعية'
                };
            
            case 'REJECTED':
                const violations = result.checks.filter(c => !c.passed);
                return {
                    ruling: 'غير جائز',
                    rulingEn: 'Not Permissible (Haram)',
                    confidence: 'عالية',
                    note: 'المعاملة تتعارض مع أحكام الشريعة الإسلامية',
                    violations: violations.map(c => ({
                        rule: c.rule.name,
                        evidence: c.rule.evidence,
                        issues: c.issues
                    })),
                    alternatives: this.suggestAlternatives(violations)
                };
            
            default:
                return {
                    ruling: 'غير محدد',
                    note: 'لم يتم التمكن من تحديد الحكم'
                };
        }
    }
    
    /**
     * تحديد شارة الامتثال
     */
    determineBadge(score) {
        if (score >= 95) {
            return {
                level: 'ذهبي',
                levelEn: 'Gold',
                icon: '⭐',
                description: 'امتثال ممتاز'
            };
        } else if (score >= 85) {
            return {
                level: 'فضي',
                levelEn: 'Silver',
                icon: '🌙',
                description: 'امتثال جيد جداً'
            };
        } else if (score >= 70) {
            return {
                level: 'برونزي',
                levelEn: 'Bronze',
                icon: '☪️',
                description: 'امتثال مقبول'
            };
        } else {
            return {
                level: 'تحت المراقبة',
                levelEn: 'Under Review',
                icon: '⚠️',
                description: 'يحتاج تحسين'
            };
        }
    }
    
    /**
     * اقتراح بدائل للمعاملات المرفوضة
     */
    suggestAlternatives(violations) {
        const alternatives = [];
        
        for (const v of violations) {
            switch (v.rule.id) {
                case 'RIBA_001':
                    alternatives.push({
                        problem: 'الربا',
                        solutions: [
                            'استخدام عقد المرابحة',
                            'البيع الآجل بسعر محدد',
                            'رسوم خدمة ثابتة بدلاً من الفائدة'
                        ]
                    });
                    break;
                case 'GHARAR_001':
                    alternatives.push({
                        problem: 'الغرر',
                        solutions: [
                            'توضيح كامل للمواصفات',
                            'التأكد من وجود السلعة',
                            'تحديد سعر ثابت'
                        ]
                    });
                    break;
                case 'GHISH_001':
                    alternatives.push({
                        problem: 'الغش',
                        solutions: [
                            'الإفصاح الكامل عن العيوب',
                            'فحص مستقل للسلعة',
                            'ضمان مطابقة المواصفات'
                        ]
                    });
                    break;
            }
        }
        
        return alternatives;
    }
    
    /**
     * الحصول على سجل التدقيق
     */
    getAuditLog(filters = {}) {
        let log = [...this.auditLog];
        
        if (filters.status) {
            log = log.filter(l => l.status === filters.status);
        }
        
        if (filters.fromDate) {
            log = log.filter(l => new Date(l.timestamp) >= new Date(filters.fromDate));
        }
        
        if (filters.toDate) {
            log = log.filter(l => new Date(l.timestamp) <= new Date(filters.toDate));
        }
        
        return log;
    }
    
    /**
     * الحصول على إحصائيات الامتثال
     */
    getComplianceStats() {
        const total = this.auditLog.length;
        if (total === 0) return { total: 0 };
        
        const approved = this.auditLog.filter(l => l.status === 'APPROVED').length;
        const approvedWithNotes = this.auditLog.filter(l => l.status === 'APPROVED_WITH_NOTES').length;
        const needsReview = this.auditLog.filter(l => l.status === 'NEEDS_REVIEW').length;
        const rejected = this.auditLog.filter(l => l.status === 'REJECTED').length;
        
        const averageScore = this.auditLog.reduce((sum, l) => sum + l.overallScore, 0) / total;
        
        return {
            total,
            approved,
            approvedWithNotes,
            needsReview,
            rejected,
            complianceRate: ((approved + approvedWithNotes) / total * 100).toFixed(2) + '%',
            averageScore: averageScore.toFixed(2)
        };
    }
}

// ─── التصدير ─────────────────────────────────────────────────────────────────────
module.exports = {
    ShariaComplianceEngine,
    SHARIA_RULES,
    QURAN_EVIDENCE,
    HADITH_EVIDENCE,
    RIBAWI_METALS
};

console.log('✅ محرك التحقق الشرعي - تم التحميل');
