import cv2
import numpy as np
import time

print("SHEIKHA OPTICS VISION - باسم شيخة")
print("العدسة تجمع الضوء، الحدقة تتكيف، الشبكية تقرأ، البصيرة تحكم")

cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
if not cap.isOpened():
    print("Camera not opened.")
    raise SystemExit

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 3)

# تكيف بصري: اترك العين تتكيف مع الضوء، مثل العين البشرية
for i in range(10):
    ret, frame = cap.read()
    time.sleep(0.2)
    if ret:
        print(f"تكيف {i+1}: ضوء {np.mean(frame):.1f}")

ret, frame = cap.read()
cap.release()
if not ret:
    print("No frame.")
    raise SystemExit

gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
light = float(np.mean(gray))
b, g, r = cv2.split(frame)
print(f"النتيجة: ضوء {light:.1f} / 255 | أحمر {np.mean(r):.0f} أخضر {np.mean(g):.0f} أزرق {np.mean(b):.0f}")
print("حكم البصيرة: العين ترى الآن بالبصريات، لا بالصورة وحدها.")
print("BOUND_BY_QURAN_SUNNAH")
