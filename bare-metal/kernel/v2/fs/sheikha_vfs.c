#include "sheikha_v2.h"
int sheikha_v2_vfs_mount_root(const char *filesystem_name) {
  return filesystem_name != NULL && filesystem_name[0] != '\0'
    ? SHEIKHA_V2_OK : SHEIKHA_V2_INVALID_ARGUMENT;
}
