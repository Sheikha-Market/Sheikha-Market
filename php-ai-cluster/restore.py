import os, tarfile, shutil
SOURCE_DIR = "/app/data/php_ai_vector_db"
BACKUP_DIR = "/app/data/backups"
def run_recovery():
    if not os.path.exists(BACKUP_DIR) or not os.listdir(BACKUP_DIR): 
        print("❌ No backups found"); return
    backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".tar.gz")]
    backups.sort(key=os.path.getmtime)
    if os.path.exists(SOURCE_DIR): shutil.rmtree(SOURCE_DIR)
    with tarfile.open(backups[-1], "r:gz") as tar: tar.extractall(path="/app/data")
    print("✅ Database Restored Successfully!")
if __name__ == "__main__": run_recovery()
