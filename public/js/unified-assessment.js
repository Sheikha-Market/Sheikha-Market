// ═══════════════════════════════════════════════════════════════════════════
// نظام التقييم الموحد الإسلامي - Sheikha Unified Islamic Assessment
// بفضل الله تعالى - نظام يتفوق على جميع الأنظمة الأخرى بالكتاب والسنة
// ═══════════════════════════════════════════════════════════════════════════

async function runUnifiedAssessment() {
    try {
        // جمع البيانات من النموذج
        const entityName = document.getElementById('entityName').value;
        const entityType = document.getElementById('entityType').value;
        const structureType = document.getElementById('structureType').value;
        const sector = document.getElementById('sector').value;

        const scores = {
            architecture: parseFloat(document.getElementById('score-architecture').value),
            organizationalStructure: parseFloat(document.getElementById('score-organizational').value),
            administrativeQuality: parseFloat(document.getElementById('score-administrative').value),
            supplyChain: parseFloat(document.getElementById('score-supply').value),
            governanceAndCompliance: parseFloat(document.getElementById('score-governance').value),
            sustainability: parseFloat(document.getElementById('score-sustainability').value),
            businessMovement: parseFloat(document.getElementById('score-business').value),
            informationFlow: parseFloat(document.getElementById('score-information').value),
            continuousImprovement: parseFloat(document.getElementById('score-improvement').value)
        };

        // التحقق من صحة المدخلات
        if (!entityName.trim()) {
            alert('⚠️ الرجاء إدخال اسم الكيان');
            return;
        }

        for (const [key, value] of Object.entries(scores)) {
            if (isNaN(value) || value < 0 || value > 100) {
                alert(`⚠️ قيمة غير صحيحة في المجال. الرجاء إدخال قيمة من 0 إلى 100`);
                return;
            }
        }

        // عرض رسالة التحميل
        const resultsDiv = document.getElementById('assessment-results');
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--gold);"><i class="fas fa-spinner fa-spin fa-3x"></i><p style="margin-top: 1rem; font-size: 1.2rem;">جاري التقييم بفضل الله...</p></div>';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });

        // إرسال الطلب إلى API
        const response = await fetch('/api/unified/islamic-assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entityName,
                entityType,
                structureType,
                sector,
                scores
            })
        });

        if (!response.ok) {
            throw new Error('فشل الاتصال بالخادم');
        }

        const result = await response.json();

        if (result.success) {
            displayAssessmentResults(result.data);
        } else {
            alert('⚠️ ' + (result.message || 'حدث خطأ في التقييم'));
            resultsDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في التقييم:', error);
        alert('⚠️ حدث خطأ: ' + error.message);
        document.getElementById('assessment-results').style.display = 'none';
    }
}

function displayAssessmentResults(data) {
    const resultsDiv = document.getElementById('assessment-results');
    
    // النتيجة الإجمالية
    const overallScoreHTML = `
        <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(212, 175, 55, 0.2)); border: 2px solid var(--gold); margin-bottom: 2rem;">
            <h2 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.8rem; text-align: center;">
                <i class="fas fa-trophy"></i> النتيجة الإجمالية
            </h2>
            <div style="text-align: center;">
                <div style="font-size: 4rem; font-weight: 900; color: var(--gold); margin: 1rem 0;">${data.overallScore.toFixed(1)}</div>
                <div style="font-size: 1.5rem; color: var(--success); font-weight: 700; margin-bottom: 1rem;">${data.classification}</div>
                <div style="color: var(--text-secondary); font-size: 1.1rem;">${getClassificationArabic(data.classification)}</div>
            </div>
        </div>
    `;

    // تقييم المجالات
    const domainNames = {
        architecture: 'الهيكلية والمعمارية',
        organizationalStructure: 'الهيكل التنظيمي',
        administrativeQuality: 'الجودة الإدارية',
        supplyChain: 'سلسلة الإمداد',
        governanceAndCompliance: 'الحوكمة والامتثال',
        sustainability: 'الاستدامة',
        businessMovement: 'حركة الأعمال',
        informationFlow: 'تدفق المعلومات',
        continuousImprovement: 'التحسين المستمر'
    };

    const weights = {
        architecture: 15,
        organizationalStructure: 15,
        administrativeQuality: 15,
        supplyChain: 15,
        governanceAndCompliance: 15,
        sustainability: 10,
        businessMovement: 5,
        informationFlow: 5,
        continuousImprovement: 5
    };

    let domainScoresHTML = '';
    for (const [key, score] of Object.entries(data.scores)) {
        const color = score >= 90 ? '#10b981' : score >= 80 ? '#f59e0b' : score >= 70 ? '#3b82f6' : '#ef4444';
        
        domainScoresHTML += `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-primary); font-weight: 600;">${domainNames[key]} (${weights[key]}%)</span>
                    <span style="color: ${color}; font-weight: 700; font-size: 1.2rem;">${score.toFixed(1)}</span>
                </div>
                <div style="width: 100%; height: 12px; background: rgba(31, 31, 46, 0.8); border-radius: 6px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: ${color}; transition: width 1s ease;"></div>
                </div>
            </div>
        `;
    }

    const domainSectionHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.4rem;">
                <i class="fas fa-tasks"></i> تقييم المجالات التسعة
            </h3>
            <div>${domainScoresHTML}</div>
        </div>
    `;

    // الخطة الزمنية
    const roadmapHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.4rem;">
                <i class="fas fa-calendar-alt"></i> خطة التحسين الزمنية
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); border-radius: 10px; padding: 1.5rem;">
                    <h4 style="color: var(--success); margin-bottom: 1rem; font-size: 1.2rem;">
                        <i class="fas fa-flag"></i> 30 يوم - الأولويات العاجلة
                    </h4>
                    <ul style="list-style: none; padding: 0; color: var(--text-primary);">
                        ${data.roadmap['30days'].map(item => `<li style="margin-bottom: 0.5rem; padding-right: 1.5rem; position: relative;"><i class="fas fa-check-circle" style="position: absolute; right: 0; color: var(--success);"></i> ${item}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--warning); border-radius: 10px; padding: 1.5rem;">
                    <h4 style="color: var(--warning); margin-bottom: 1rem; font-size: 1.2rem;">
                        <i class="fas fa-flag"></i> 60 يوم - التحسينات المتوسطة
                    </h4>
                    <ul style="list-style: none; padding: 0; color: var(--text-primary);">
                        ${data.roadmap['60days'].map(item => `<li style="margin-bottom: 0.5rem; padding-right: 1.5rem; position: relative;"><i class="fas fa-check-circle" style="position: absolute; right: 0; color: var(--warning);"></i> ${item}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--gold); border-radius: 10px; padding: 1.5rem;">
                    <h4 style="color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">
                        <i class="fas fa-flag"></i> 90 يوم - الأهداف الاستراتيجية
                    </h4>
                    <ul style="list-style: none; padding: 0; color: var(--text-primary);">
                        ${data.roadmap['90days'].map(item => `<li style="margin-bottom: 0.5rem; padding-right: 1.5rem; position: relative;"><i class="fas fa-check-circle" style="position: absolute; right: 0; color: var(--gold);"></i> ${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    // التوصيات
    const recommendationsHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="color: var(--gold); margin-bottom: 1.5rem; font-size: 1.4rem;">
                <i class="fas fa-lightbulb"></i> التوصيات التفصيلية
            </h3>
            <div style="display: grid; gap: 1rem;">
                ${data.recommendations.map((rec, index) => `
                    <div style="background: rgba(31, 31, 46, 0.8); border: 1px solid var(--border); border-radius: 8px; padding: 1rem;">
                        <div style="color: var(--gold); font-weight: 700; margin-bottom: 0.5rem;">
                            <i class="fas fa-arrow-left"></i> توصية ${index + 1}
                        </div>
                        <div style="color: var(--text-primary);">${rec}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // الأساس الشرعي
    let islamicFoundationHTML = '';
    if (data.islamicFoundation) {
        islamicFoundationHTML = `
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(184, 115, 51, 0.15)); border: 2px solid var(--gold); border-radius: 15px; padding: 2rem; margin-top: 2rem; text-align: center;">
                <h3 style="color: var(--gold); margin-bottom: 1rem; font-size: 1.3rem;">
                    <i class="fas fa-book-open"></i> الأساس الشرعي للتقييم
                </h3>
                <div style="text-align: right; max-width: 900px; margin: 0 auto;">
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: var(--gold); margin-bottom: 1rem;">آيات قرآنية:</h4>
                        ${data.islamicFoundation.quran.map(ayah => `
                            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <p style="font-size: 1.2rem; color: var(--gold); font-weight: 700;">${ayah.text}</p>
                                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${ayah.reference}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div>
                        <h4 style="color: var(--gold); margin-bottom: 1rem;">أحاديث نبوية:</h4>
                        ${data.islamicFoundation.hadith.map(hadith => `
                            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <p style="font-size: 1.1rem; color: var(--text-primary);">${hadith.text}</p>
                                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${hadith.reference}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // دمج كل الأقسام
    resultsDiv.innerHTML = overallScoreHTML + domainSectionHTML + roadmapHTML + recommendationsHTML + islamicFoundationHTML;
}

function getClassificationArabic(classification) {
    const classificationAr = {
        'world-class': '🏆 مستوى عالمي - بفضل الله',
        'excellent': '⭐ ممتاز - ماشاء الله',
        'good': '✓ جيد - بحاجة لتحسين',
        'developing': '○ تحت التطوير',
        'critical': '✗ حرج - يحتاج تدخل فوري'
    };
    return classificationAr[classification] || classification;
}

console.log('🕌 نظام التقييم الموحد الإسلامي - جاهز بفضل الله');
