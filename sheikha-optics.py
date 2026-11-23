#!/usr/bin/env python3
# SHEIKHA OPTICS - البصريات، لا الصورة - باسم شيخة
import cv2
import numpy as np
import subprocess
import json

print("SHEIKHA OPTICS - البصريات الحية - باسم شيخة:")
print("1. العدسة Lens: تجمع الضوء وتكسره، مثل قرنية العين")
print("2. الحدقة Iris: تتسع في الظلام، تضيق في النور، مثل فتحة الكاميرا")
print("3. الشبكية Retina: تقرأ الضوء واللون، مثل حساس الكاميرا")
print("4. البؤرة Focus: حيث تجتمع الأشعة لتكون صورة واضحة")
print("5. البصيرة Basira: الحكم على المعنى، ليس الشكل فقط")

# قانون العدسة: 1/f = 1/do + 1/di
def lens(f, do):
    if do <= f:
        return None
    di = 1 / (1/f - 1/do)
    m = -di / do
    return di, m

f = 3.5
for do in [10, 30, 100, 500]:
    di, m = lens(f, do)
    print(f"جسم على بعد {do} سم، بؤرة {f} سم: الصورة على {di:.2f} سم، تكبير {m:.3f}")

# قياس الضوء الحي من البصريات نفسها، بدون حفظ صورة
cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
if not cap.isOpened():
    print("Camera not opened. Check hardware.")
    raise SystemExit

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 3)
cap.set(cv2.CAP_PROP_EXPOSURE, -4)

print("\nOPTICS LIVE MEASURE - قياس الضوء الحي:")
for i in range(5):
    ret, frame = cap.read()
    if not ret:
        continue
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    light = float(np.mean(gray))
    b, g, r = cv2.split(frame)
    print(f"قياس {i+1}: ضوء {light:.1f} / 255 | أحمر {np.mean(r):.0f} أخضر {np.mean(g):.0f} أزرق {np.mean(b):.0f}")
    if light < 5:
        print("  حكم البصريات: لا ضوء داخل. العدسة مغلقة، أو الغالق الفيزيائي مغلق، أو الغرفة مظلمة تماما.")
        print("  علاج البصريات: افتح الغالق، زد نور الغرفة، قرب مصباحا من الكاميرا.")
    elif light < 80:
        print("  حكم البصريات: ضوء خافت، الحدقة يجب أن تتسع.")
    else:
        print("  حكم البصريات: ضوء جيد، العين ترى الآن.")
cap.release()

# قراءة إعدادات البصريات من النظام نفسه
try:
    out = subprocess.check_output(["v4l2-ctl", "-d", "/dev/video0", "--list-ctrls"], text=True)
    print("\nV4L2 OPTICS CONTROLS - إعدادات البصريات في جهازك:")
    for line in out.splitlines():
        if any(k in line for k in ["brightness", "contrast", "exposure", "focus", "gain", "privacy", "sharpness"]):
            print(" ", line.strip())
except Exception as e:
    print("v4l2-ctl not found:", e)

print("\nBOUND_BY_QURAN_SUNNAH - العين ترى بالبصريات، والعقل يحكم بالبصيرة.")
