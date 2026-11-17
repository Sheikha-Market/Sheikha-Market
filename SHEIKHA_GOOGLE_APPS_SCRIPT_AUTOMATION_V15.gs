/**
 * ═════════════════════════════════════════════════════════════════════════════
 * شيخة نيتف — Google Apps Script لأتمتة البريد الإلكتروني والمراقبة
 * SHEIKHA NATIVE — Email Automation & Monitoring Script V15.0
 * ═════════════════════════════════════════════════════════════════════════════
 */

// ✅ الخطوة 1: متغيرات الإعدادات الرئيسية
const CONFIG = {
  sheikhaEmail: "partnerships@sheikha.top",
  adminEmail: "admin@sheikha.top",
  spreadsheetId: "", // سيتم ملؤه من قبل المستخدم
  driveFolder: "SHEIKHA_PARTNERSHIP_AUTOMATION",
  
  partners: [
    {
      id: "MICROSOFT_001",
      name: "Microsoft",
      email: "partnerships@microsoft.com",
      subject: "Sheikha Native v22.0.0 — Strategic Partnership & Investment Opportunity",
      priority: "HIGH",
      responseDeadlineDays: 5,
      timezone: "UTC"
    },
    {
      id: "GOOGLE_001",
      name: "Google",
      email: "partners@google.com",
      subject: "Sheikha Native v22.0.0 — Strategic Partnership & Investment Opportunity",
      priority: "HIGH",
      responseDeadlineDays: 5,
      timezone: "UTC"
    },
    {
      id: "OPENAI_001",
      name: "OpenAI",
      email: "partnerships@openai.com",
      subject: "Sheikha Native v22.0.0 — OpenAI Partner Network Strategic Integration",
      priority: "HIGH",
      responseDeadlineDays: 5,
      timezone: "UTC"
    },
    {
      id: "CLOUDFLARE_001",
      name: "Cloudflare",
      email: "partners@cloudflare.com",
      subject: "Sheikha Native v22.0.0 — Strategic Partnership & Investment Opportunity",
      priority: "HIGH",
      responseDeadlineDays: 5,
      timezone: "UTC"
    },
    {
      id: "SAUDI_INVESTORS_001",
      name: "Saudi Investors",
      email: "investors@saudi-vc.fund",
      subject: "استثمار في تكنولوجيا سيادية — منصة شيخة نيتف v22.0.0",
      priority: "URGENT",
      responseDeadlineDays: 3,
      timezone: "Asia/Riyadh"
    }
  ],
  
  labels: {
    sentEmails: "Sheikha/Sent",
    receivedReplies: "Sheikha/Replies",
    followUp: "Sheikha/FollowUp",
    urgent: "Sheikha/URGENT"
  }
};

/**
 * ✅ الخطوة 2: إنشاء التسميات (Labels) في Gmail
 */
function createGmailLabels() {
  const labelNames = Object.values(CONFIG.labels);
  
  for (let labelName of labelNames) {
    try {
      Gmail.Users.Labels.create({
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show"
      }, "me");
      Logger.log(`✅ تم إنشاء التسمية: ${labelName}`);
    } catch (e) {
      Logger.log(`⚠️ التسمية موجودة بالفعل: ${labelName}`);
    }
  }
}

/**
 * ✅ الخطوة 3: إرسال الرسائل البريدية الموثقة
 */
function sendPartnershipEmails() {
  const emailContent = {
    ar: `بسم الله الرحمن الرحيم

الحمد لله والشكر لله على استقبالك لرسالتنا الموجهة إليك بشأن منصة شيخة نيتف v22.0.0.

تقديري لاهتمامك بهذه الفرصة الاستثمارية والشراكة الاستراتيجية.

**المعلومات الأساسية:**
• المالك: مؤسسة سلمان أحمد بن سلمان الراجح للتجارة
• السجل التجاري: 2051263653
• المنصة الرسمية: https://sheikha.top
• البريد الإلكتروني: market@sheikha.top

**الفرصة:**
شيخة نيتف هي منظومة تقنية متكاملة تجمع بين:
✅ أنظمة أصلية (Native Systems) و Bare Metal
✅ خوادم سحابية موزعة عبر 15 Cloudflare Workers
✅ معايير حوكمة عالية (BOUND_BY_QURAN_SUNNAH)
✅ أول صفقة مغلقة بقيمة 397,900 ريال سعودي

**نحن هنا للإجابة على استفساراتك:**
📧 partnerships@sheikha.top
⏰ ساعات العمل: السبت - الخميس، 09:00 - 17:00 (GMT+3)

والسلام عليكم ورحمة الله وبركاته
فريق شيخة`,

    en: `Subject: Sheikha Native v22.0.0 — Strategic Partnership & Investment Opportunity

Greetings,

Thank you for receiving our partnership proposal regarding Sheikha Native v22.0.0.

We appreciate your interest in this investment and strategic partnership opportunity.

**Key Information:**
• Owner: Salman Ahmed bin Salman Al-Rajih Trading Establishment
• Commercial Registration: 2051263653
• Official Platform: https://sheikha.top
• Business Email: market@sheikha.top

**The Opportunity:**
Sheikha Native is an integrated technology ecosystem combining:
✅ Native Systems & Bare Metal Infrastructure
✅ Distributed Cloud Servers (15 Active Cloudflare Workers)
✅ High Governance Standards (BOUND_BY_QURAN_SUNNAH)
✅ First Closed Deal Worth 397,900 SAR

**Our Partnership Team:**
📧 partnerships@sheikha.top
⏰ Business Hours: Sat-Thu, 09:00-17:00 (GMT+3)

Best regards,
Sheikha Team`
  };

  const sentEmails = [];

  for (let partner of CONFIG.partners) {
    try {
      const isArabic = partner.id.includes("SAUDI");
      const body = isArabic ? emailContent.ar : emailContent.en;

      // إرسال البريد الإلكتروني
      MailApp.sendEmail(
        partner.email,
        partner.subject,
        body,
        {
          from: CONFIG.sheikhaEmail,
          name: "Sheikha Partnerships",
          replyTo: CONFIG.sheikhaEmail,
          noReply: false
        }
      );

      // تسجيل الإرسال
      const sentRecord = {
        partnerId: partner.id,
        partnerName: partner.name,
        email: partner.email,
        sentTime: new Date(),
        status: "SENT",
        responseDeadline: calculateDeadline(partner.responseDeadlineDays),
        priority: partner.priority,
        followUpRequired: false
      };

      sentEmails.push(sentRecord);

      Logger.log(`✅ تم إرسال البريد إلى: ${partner.name} (${partner.email})`);

    } catch (e) {
      Logger.log(`❌ فشل الإرسال إلى: ${partner.name} - الخطأ: ${e.message}`);
    }
  }

  // حفظ السجل
  saveEmailLog(sentEmails);

  return sentEmails;
}

/**
 * ✅ الخطوة 4: تفعيل القواعس الآلية (Auto-Reply Rules)
 */
function enableAutoReplyRules() {
  const filters = [
    {
      criteria: {
        from: "partnerships@microsoft.com",
        subject: "Sheikha",
        hasAttachment: false
      },
      action: {
        addLabel: CONFIG.labels.receivedReplies,
        star: true,
        markImportant: true,
        forwardTo: CONFIG.adminEmail
      }
    },
    {
      criteria: {
        from: ["partners@google.com", "partnerships@openai.com", "partners@cloudflare.com"],
        subject: "Sheikha",
        hasAttachment: false
      },
      action: {
        addLabel: CONFIG.labels.receivedReplies,
        star: true,
        markImportant: true,
        forwardTo: CONFIG.adminEmail
      }
    }
  ];

  // ملاحظة: يجب تطبيق هذه الفلاتر يدوياً من خلال واجهة Gmail
  Logger.log(`
  ⚠️ يجب تطبيق الفلاتر التالية يدوياً في Gmail:
  
  1️⃣ من Microsoft:
     - البحث: from:partnerships@microsoft.com
     - الإجراء: إضافة تسمية، وضع نجمة، تمييز كمهم، إعادة توجيه إلى ${CONFIG.adminEmail}
  
  2️⃣ من Google/OpenAI/Cloudflare:
     - البحث: from:(partners@google.com OR partnerships@openai.com OR partners@cloudflare.com)
     - الإجراء: إضافة تسمية، وضع نجمة، تمييز كمهم، إعادة توجيه إلى ${CONFIG.adminEmail}
  `);
}

/**
 * ✅ الخطوة 5: مراقبة الردود والمتابعة التلقائية
 */
function monitorRepliesAndFollowUp() {
  const now = new Date();
  const emailLog = getEmailLog();

  for (let record of emailLog) {
    const sentTime = new Date(record.sentTime);
    const hoursPassed = (now - sentTime) / (1000 * 60 * 60);
    const deadline = new Date(record.responseDeadline);

    // فحص إذا تجاوزت الفترة الزمنية بدون رد
    if (hoursPassed > (record.responseDeadlineDays * 24)) {
      Logger.log(`⚠️ تنبيه: لم نتلق رداً من ${record.partnerName} خلال ${record.responseDeadlineDays} أيام`);

      // إرسال بريد متابعة
      sendFollowUpEmail(record);

      // تحديث السجل
      record.followUpRequired = true;
      record.followUpSentTime = now;
    }

    // إذا مر 48 ساعة بدون رد - تنبيه إداري
    if (hoursPassed > 48 && !record.followUpRequired) {
      Logger.log(`🔴 تنبيه عاجل: لم نتلق رداً من ${record.partnerName} خلال 48 ساعة`);
      sendAdminAlert(record, "48h_no_response");
    }

    // إذا مر 72 ساعة بدون رد - تصعيد
    if (hoursPassed > 72) {
      Logger.log(`🚨 تصعيد: تجاوزت مهلة الرد من ${record.partnerName}`);
      sendAdminAlert(record, "72h_escalation");
    }
  }

  // حفظ السجل المحدث
  saveEmailLog(emailLog);
}

/**
 * ✅ الخطوة 6: إرسال بريد المتابعة
 */
function sendFollowUpEmail(record) {
  const followUpContent = {
    ar: `بسم الله الرحمن الرحيم

الحمد لله والشكر لله على اهتمامك بمنصة شيخة نيتف.

هذا بريد متابعة ودي لرسالتنا السابقة المرسلة في ${record.sentTime}.

هل لديك أي استفسارات أو تعليقات على العرض؟ نحن هنا للمساعدة.

📧 partnerships@sheikha.top
📞 +966-xxxxxxx (عند الطلب)
⏰ ساعات العمل: السبت - الخميس، 09:00 - 17:00 (GMT+3)

والسلام عليكم ورحمة الله وبركاته
فريق شيخة`,

    en: `Subject: RE: Sheikha Native v22.0.0 — Strategic Partnership & Investment Opportunity [Follow-up]

Greetings,

This is a friendly follow-up regarding our previous partnership proposal sent on ${record.sentTime}.

Do you have any questions or comments about our offer? We're here to help.

📧 partnerships@sheikha.top
📞 +966-xxxxxxx (upon request)
⏰ Business Hours: Sat-Thu, 09:00-17:00 (GMT+3)

Best regards,
Sheikha Team`
  };

  try {
    const isArabic = record.partnerId.includes("SAUDI");
    const body = isArabic ? followUpContent.ar : followUpContent.en;

    MailApp.sendEmail(
      record.email,
      `RE: ${record.partnerName} Partnership Follow-up`,
      body,
      {
        from: CONFIG.sheikhaEmail,
        replyTo: CONFIG.sheikhaEmail,
        noReply: false
      }
    );

    Logger.log(`✅ تم إرسال بريد المتابعة إلى: ${record.partnerName}`);
  } catch (e) {
    Logger.log(`❌ فشل إرسال بريد المتابعة إلى: ${record.partnerName} - الخطأ: ${e.message}`);
  }
}

/**
 * ✅ الخطوة 7: إرسال تنبيهات إدارية
 */
function sendAdminAlert(record, reason) {
  const alertContent = `
⚠️ تنبيه شيخة — مراقبة الشراكات

شريك: ${record.partnerName}
البريد: ${record.email}
السبب: ${reason}
تم الإرسال: ${record.sentTime}
الوقت الحالي: ${new Date()}

يرجى المتابعة اليدوية إن لزم الأمر.

---
نظام المراقبة الآلي — شيخة نيتف V15
`;

  try {
    MailApp.sendEmail(
      CONFIG.adminEmail,
      `🚨 تنبيه: ${record.partnerName} - ${reason}`,
      alertContent,
      {
        from: CONFIG.sheikhaEmail,
        replyTo: CONFIG.sheikhaEmail
      }
    );

    Logger.log(`✅ تم إرسال التنبيه الإداري`);
  } catch (e) {
    Logger.log(`❌ فشل إرسال التنبيه الإداري - الخطأ: ${e.message}`);
  }
}

/**
 * ✅ الخطوة 8: دوال المساعدة
 */
function calculateDeadline(days) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline.toISOString();
}

function saveEmailLog(emailLog) {
  const doc = SpreadsheetApp.create("SHEIKHA_EMAIL_LOG_" + new Date().getTime());
  const sheet = doc.getActiveSheet();

  // إضافة الرؤوس
  sheet.appendRow([
    "Partner ID", "Partner Name", "Email", "Sent Time", "Status", 
    "Response Deadline", "Priority", "Follow-up Required"
  ]);

  // إضافة البيانات
  for (let record of emailLog) {
    sheet.appendRow([
      record.partnerId,
      record.partnerName,
      record.email,
      record.sentTime,
      record.status,
      record.responseDeadline,
      record.priority,
      record.followUpRequired ? "YES" : "NO"
    ]);
  }

  Logger.log(`✅ تم حفظ السجل في: ${doc.getUrl()}`);
}

function getEmailLog() {
  // في الواقع، يجب استرجاع البيانات من جدول بيانات موجود
  // هذا مثال بسيط
  return [];
}

/**
 * ✅ الخطوة 9: تشغيل جميع الوظائف
 */
function main() {
  Logger.log("🎯 بدء تشغيل نظام أتمتة البريد الإلكتروني — شيخة نيتف V15");

  // 1. إنشاء التسميات
  createGmailLabels();

  // 2. إرسال الرسائل
  const sentEmails = sendPartnershipEmails();
  Logger.log(`✅ تم إرسال ${sentEmails.length} رسالة بنجاح`);

  // 3. تفعيل القواعد الآلية
  enableAutoReplyRules();

  // 4. جدولة المراقبة (كل 15 دقيقة)
  ScriptApp.newTrigger("monitorRepliesAndFollowUp")
    .timeBased()
    .everyMinutes(15)
    .create();

  Logger.log("✅ تم تفعيل نظام المراقبة والمتابعة الآلية");
  Logger.log("🎉 انتهى الإعداد بنجاح!");
}

// تشغيل البرنامج
// main();
