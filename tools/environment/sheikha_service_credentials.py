"""Bounded reads from systemd's per-service credential directory, without I/O fallback."""
import os
from pathlib import Path
import stat

ALLOWED_IDS = frozenset({"hostinger_api_token", "sheikha_probe"})
MAX_BYTES = 8192


class CredentialUnavailable(RuntimeError):
    pass


def _private(info):
    return info.st_uid in (0, os.geteuid()) and not (stat.S_IMODE(info.st_mode) & 0o077)


def _identity(info):
    return info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns


def read_credential(credential_id, directory=None):
    if not isinstance(credential_id, str) or credential_id not in ALLOWED_IDS:
        raise CredentialUnavailable("CREDENTIAL_NOT_ADMITTED")
    directory = os.environ.get("CREDENTIALS_DIRECTORY") if directory is None else directory
    if not isinstance(directory, str) or not directory or not Path(directory).is_absolute():
        raise CredentialUnavailable("CREDENTIAL_DIRECTORY_REQUIRED")
    parent_fd = file_fd = None
    try:
        parent_fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_NONBLOCK)
        parent = os.fstat(parent_fd)
        if not _private(parent):
            raise CredentialUnavailable("CREDENTIAL_DIRECTORY_NOT_PRIVATE")
        file_fd = os.open(credential_id, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent_fd)
        before = os.fstat(file_fd)
        if (not stat.S_ISREG(before.st_mode) or not _private(before) or before.st_nlink != 1
                or before.st_size <= 0 or before.st_size > MAX_BYTES):
            raise CredentialUnavailable("CREDENTIAL_FILE_NOT_ADMITTED")
        chunks, size = [], 0
        while size <= MAX_BYTES:
            chunk = os.read(file_fd, MAX_BYTES + 1 - size)
            if not chunk:
                break
            chunks.append(chunk)
            size += len(chunk)
        after = os.stat(credential_id, dir_fd=parent_fd, follow_symlinks=False)
        if (_identity(before) != _identity(os.fstat(file_fd)) or _identity(before) != _identity(after)
                or size != before.st_size or size > MAX_BYTES):
            raise CredentialUnavailable("CREDENTIAL_CHANGED_OR_OVERSIZED")
        return b"".join(chunks)
    except CredentialUnavailable:
        raise
    except Exception:
        raise CredentialUnavailable("CREDENTIAL_UNAVAILABLE") from None
    finally:
        if file_fd is not None:
            os.close(file_fd)
        if parent_fd is not None:
            os.close(parent_fd)
