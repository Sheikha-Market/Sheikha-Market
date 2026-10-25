import subprocess, time
print(f"👁️ WATCHER V52.1 {time.strftime('%H:%M:%S')}")
print(subprocess.getoutput("podman ps --format '{{.Names}} {{.Status}} {{.Ports}}'"))
