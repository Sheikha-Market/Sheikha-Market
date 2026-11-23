import cv2
import numpy as np

img = cv2.imread("sheikha-eye-frame.jpg")
if img is None:
    print("No frame found. Run python3 sheikha-vision.py first.")
    raise SystemExit

h, w, _ = img.shape
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
brightness = float(np.mean(gray))
contrast = float(np.std(gray))
edges = cv2.Canny(gray, 50, 150)
edge_ratio = float(np.mean(edges > 0) * 100)

b, g, r = cv2.split(img)
red = float(np.mean(r))
green = float(np.mean(g))
blue = float(np.mean(b))
dominant = "red" if red > green and red > blue else "green" if green > blue else "blue"

contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
big = [c for c in contours if cv2.contourArea(c) > 500]

print("SHEIKHA VISION - WHAT I SAW - باسم شيخة:")
print(f"1. Size: {w} x {h} pixels")
print(f"2. Brightness: {brightness:.1f} / 255 - {'bright scene' if brightness > 150 else 'medium light' if brightness > 80 else 'dark scene, low light'}")
print(f"3. Contrast: {contrast:.1f} - {'clear shapes' if contrast > 40 else 'soft, low detail'}")
print(f"4. Edges: {edge_ratio:.2f}% of image - {'many objects and lines' if edge_ratio > 3 else 'few objects, calm scene'}")
print(f"5. Dominant color: {dominant} - R:{red:.0f} G:{green:.0f} B:{blue:.0f}")
print(f"6. Large shapes found: {len(big)}")
print("7. Eye lesson: Lens captured light, Retina read color and edges, Brain judged brightness and shapes.")
print("8. Basira: I do not guess names or faces. I describe light, color, shape, and meaning only.")
print("EDUCATIONAL ONLY - for learning, no face recognition, no upload.")
