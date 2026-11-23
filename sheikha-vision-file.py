import cv2, sys
path = sys.argv[1] if len(sys.argv) > 1 else "sheikha-eye-frame.jpg"
img = cv2.imread(path)
if img is None:
    print("File not found:", path)
    raise SystemExit
print(f"Loaded {path}: {img.shape}")
cv2.imwrite("sheikha-eye-frame.jpg", img)
print("Sheikha learned from file, not from blocked camera.")
