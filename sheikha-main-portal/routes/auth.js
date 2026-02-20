/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔐 مسارات المصادقة
 *  Authentication Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const database = require('../config/database');
const config = require('../config/config');

// ─── تسجيل مستخدم جديد ────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role = 'user' } = req.body;

        // التحقق من البيانات
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البيانات المطلوبة: name, email, password'
            });
        }

        // التحقق من عدم وجود المستخدم
        const users = database.read('users') || [];
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'البريد الإلكتروني مستخدم مسبقاً'
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password + config.security.jwt.secret)
            .digest('hex');

        // إنشاء المستخدم
        const user = {
            id: require('uuid').v4(),
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            role,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        database.insert('users', user);

        // إنشاء التوكن
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.security.jwt.secret,
            { expiresIn: config.security.jwt.expiresIn }
        );

        // إزالة كلمة المرور من الرد
        const { password: _, ...safeUser } = user;

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            user: safeUser,
            token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الحساب',
            error: error.message
        });
    }
});

// ─── تسجيل الدخول ─────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البيانات المطلوبة: email, password'
            });
        }

        // البحث عن المستخدم
        const users = database.read('users') || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password + config.security.jwt.secret)
            .digest('hex');

        if (user.password !== hashedPassword) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        // تحديث آخر تسجيل دخول
        database.update('users', user.id, { lastLogin: new Date().toISOString() });

        // إنشاء التوكن
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.security.jwt.secret,
            { expiresIn: config.security.jwt.expiresIn }
        );

        // إزالة كلمة المرور من الرد
        const { password: _, ...safeUser } = user;

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: safeUser,
            token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الدخول',
            error: error.message
        });
    }
});

// ─── تحديث التوكن ─────────────────────────────────────────────────────────────

router.post('/refresh', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'التوكن مطلوب'
            });
        }

        // التحقق من التوكن القديم
        const decoded = jwt.verify(token, config.security.jwt.secret, { ignoreExpiration: true });

        // إنشاء توكن جديد
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role },
            config.security.jwt.secret,
            { expiresIn: config.security.jwt.expiresIn }
        );

        res.json({
            success: true,
            token: newToken
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'التوكن غير صالح'
        });
    }
});

// ─── معلومات المستخدم الحالي ──────────────────────────────────────────────────

router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح'
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.security.jwt.secret);

        const users = database.read('users') || [];
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        const { password: _, ...safeUser } = user;

        res.json({
            success: true,
            user: safeUser
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'التوكن غير صالح'
        });
    }
});

// ─── تسجيل الخروج ─────────────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
    // في JWT، تسجيل الخروج يتم من جانب العميل بحذف التوكن
    // يمكن إضافة قائمة سوداء للتوكنات إذا لزم الأمر
    res.json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
    });
});

module.exports = router;
