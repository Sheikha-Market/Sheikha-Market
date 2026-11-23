#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA SCIENTIFIC & SWARM ORCHESTRATOR DASHBOARD (Tkinter GUI + CLI Fallback)
Seal: BOUND_BY_QURAN_SUNNAH | Supports Local (Ollama / Ring-0) & Cloud Hybrid Execution
"""
import sys
import subprocess

def main():
    if "--headless" in sys.argv or not sys.stdout.isatty():
        subprocess.run([sys.executable, "generated/advanced_orchestrator.py"], check=False)
        return
    try:
        import tkinter as tk
        from tkinter import scrolledtext
        import threading
    except Exception:
        print("ℹ️ [تشغيل مباشر في الطرفية]:")
        subprocess.run([sys.executable, "generated/advanced_orchestrator.py"], check=False)
        return

    try:
        root = tk.Tk()
    except Exception:
        subprocess.run([sys.executable, "generated/advanced_orchestrator.py"], check=False)
        return

    root.title("منظومة شيخة — لوحة المنسق العلمي وأسراب الوكلاء (SHK-DxO)")
    root.geometry("860x560")
    root.configure(bg="#050811")

    lbl = tk.Label(root, text="منسق شيخة العلمي والطبي وأسراب الوكلاء (BOUND_BY_QURAN_SUNNAH)", fg="#fbbf24", bg="#050811", font=("Arial", 14, "bold"))
    lbl.pack(pady=10)

    log_box = scrolledtext.ScrolledText(root, width=98, height=23, bg="#0b1120", fg="#a7f3d0", font=("Courier", 10))
    log_box.pack(padx=12, pady=8)

    def run_swarm():
        def task():
            out = subprocess.getoutput(f"{sys.executable} generated/advanced_orchestrator.py")
            log_box.insert(tk.END, out + "\n" + "="*72 + "\n")
            log_box.see(tk.END)
        threading.Thread(target=task, daemon=True).start()

    btn = tk.Button(root, text="⚡ إطلاق سرب الوكلاء والتخليق الديناميكي وتوثيق البراءة CSV", bg="#d4af37", fg="#000", font=("Arial", 11, "bold"), command=run_swarm)
    btn.pack(pady=8)
    run_swarm()
    root.mainloop()

if __name__ == "__main__":
    main()
