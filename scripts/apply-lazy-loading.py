#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# بسم الله الرحمن الرحيم
# P0-1: تعليق المحركات غير الحرجة (Lazy Loading)

import re
import sys

# المحركات الحرجة L0 (21 محرك) — لا تُعلّق
CRITICAL_ENGINES = {
    'sheikha-security-engine.js',
    'sheikha-sharia-engine.js',
    'sheikha-admin-blueprint-engine.js',
    'sheikha-hadith-standards-engine.js',
    'sheikha-quran-trade-engine.js',
    'sheikha-taqwa-engine.js',
    'sheikha-musharri-engine.js',
    'sheikha-legal-engine.js',
    'sheikha-souq-madinah-engine.js',
    'sheikha-market-structure-engine.js',
    'sheikha-metals-market-engine.js',
    'sheikha-banking-engine.js',
    'sheikha-trade-engine.js',
    'sheikha-supply-logistics-engine.js',
    'sheikha-dashboard-engine.js',
    'sheikha-experience-engine.js',
    'sheikha-pilot-engine.js',
    'sheikha-segments-engine.js',
    'sheikha-historical-engine.js',
    'sheikha-quran-sunnah-engine.js',
    'sheikha-brand-engine.js'
}

def is_critical_engine(line):
    """تحقق: هل السطر يحمّل محرك حرج؟"""
    for engine in CRITICAL_ENGINES:
        if f"'{engine}'" in line or f'"{engine}"' in line or f"/{engine}" in line:
            return True
    return False

def process_server_file(input_file, output_file):
    """معالجة server.js وتعليق المحركات غير الحرجة"""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    output_lines = []
    in_engine_block = False
    engine_block = []
    engine_name = None
    commented_count = 0
    kept_count = 0
    
    for i, line in enumerate(lines):
        # تحقق: هل السطر يحتوي على require engine
        if "require('./lib/sheikha-" in line and "-engine.js')" in line:
            # استخرج اسم المحرك
            match = re.search(r"require\('\.\/lib\/(sheikha-[^']+\.js)'\)", line)
            if match:
                engine_name = match.group(1)
                in_engine_block = True
                engine_block = [line]
                continue
        
        # إذا كنا في كتلة محرك
        if in_engine_block:
            engine_block.append(line)
            
            # تحقق: هل انتهت الكتلة؟
            if line.strip().startswith('}') or (line.strip() and not line.strip().startswith('//')):
                # تحقق: هل المحرك حرج؟
                is_critical = engine_name in CRITICAL_ENGINES
                
                if is_critical:
                    # احتفظ به كما هو
                    output_lines.extend(engine_block)
                    kept_count += 1
                    print(f"✅ KEPT: {engine_name}")
                else:
                    # علّق الكتلة
                    output_lines.append(f"// ⏸️ [P0-1 LAZY] {engine_name} — يُحمّل عند الطلب\n")
                    for block_line in engine_block:
                        output_lines.append(f"// {block_line}")
                    commented_count += 1
                    print(f"⏸️ COMMENTED: {engine_name}")
                
                # أعد ضبط الحالة
                in_engine_block = False
                engine_block = []
                engine_name = None
                continue
        
        # إذا لم نكن في كتلة، أضف السطر كما هو
        if not in_engine_block:
            output_lines.append(line)
    
    # اكتب الملف المعدل
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print(f"\n═══ P0-1 Summary ═══")
    print(f"✅ محركات حرجة (L0): {kept_count}")
    print(f"⏸️ محركات معلقة: {commented_count}")
    print(f"📦 الملف المعدل: {output_file}")

if __name__ == '__main__':
    input_file = '/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal/server.js'
    output_file = '/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal/server.js.p0-1-lazy'
    
    process_server_file(input_file, output_file)
    print(f"\n✅ تم. راجع الملف وإذا صحيح، نفّذ:")
    print(f"   mv {output_file} {input_file}")
