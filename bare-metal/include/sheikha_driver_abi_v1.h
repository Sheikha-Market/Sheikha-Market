#ifndef SHEIKHA_DRIVER_ABI_V1_H
#define SHEIKHA_DRIVER_ABI_V1_H

#include <stddef.h>
#include <stdint.h>

#define SHEIKHA_DRIVER_ABI_V1 0x00010000u
#define SHEIKHA_DRIVER_CONTEXT_MAGIC 0x53484452u

typedef uint64_t sheikha_driver_capability_mask_t;

enum sheikha_driver_capability {
  SHEIKHA_DRIVER_CAP_DISCOVER = 1ull << 0,
  SHEIKHA_DRIVER_CAP_READ = 1ull << 1,
  SHEIKHA_DRIVER_CAP_WRITE = 1ull << 2,
  SHEIKHA_DRIVER_CAP_IRQ = 1ull << 3,
  SHEIKHA_DRIVER_CAP_DMA = 1ull << 4,
  SHEIKHA_DRIVER_CAP_NETWORK = 1ull << 5,
  SHEIKHA_DRIVER_CAP_POWER = 1ull << 6,
  SHEIKHA_DRIVER_CAP_ACTUATE = 1ull << 7,
  SHEIKHA_DRIVER_CAP_STORAGE_MUTATE = 1ull << 8,
  SHEIKHA_DRIVER_CAP_FIRMWARE_MUTATE = 1ull << 9,
  SHEIKHA_DRIVER_CAP_SAFETY_CONTROL = 1ull << 10
};

#define SHEIKHA_DRIVER_HIGH_IMPACT_MASK \
  (SHEIKHA_DRIVER_CAP_WRITE | SHEIKHA_DRIVER_CAP_DMA | \
   SHEIKHA_DRIVER_CAP_NETWORK | SHEIKHA_DRIVER_CAP_POWER | \
   SHEIKHA_DRIVER_CAP_ACTUATE | SHEIKHA_DRIVER_CAP_STORAGE_MUTATE | \
   SHEIKHA_DRIVER_CAP_FIRMWARE_MUTATE | SHEIKHA_DRIVER_CAP_SAFETY_CONTROL)

enum sheikha_driver_status {
  SHEIKHA_DRIVER_OK = 0,
  SHEIKHA_DRIVER_NOT_SUPPORTED = -1,
  SHEIKHA_DRIVER_INVALID_ARGUMENT = -2,
  SHEIKHA_DRIVER_DENIED = -3,
  SHEIKHA_DRIVER_NOT_READY = -4,
  SHEIKHA_DRIVER_IO_ERROR = -5,
  SHEIKHA_DRIVER_TIMEOUT = -6,
  SHEIKHA_DRIVER_NEEDS_APPROVAL = -7,
  SHEIKHA_DRIVER_INTEGRITY_ERROR = -8
};

enum sheikha_driver_lifecycle_state {
  SHEIKHA_DRIVER_REGISTERED = 0,
  SHEIKHA_DRIVER_PROBED = 1,
  SHEIKHA_DRIVER_BOUND = 2,
  SHEIKHA_DRIVER_INITIALIZED = 3,
  SHEIKHA_DRIVER_RUNNING = 4,
  SHEIKHA_DRIVER_QUIESCED = 5,
  SHEIKHA_DRIVER_FAILED = 6,
  SHEIKHA_DRIVER_DETACHED = 7
};

enum sheikha_driver_safety_class {
  SHEIKHA_SAFETY_OBSERVATION = 0,
  SHEIKHA_SAFETY_DATA_PATH = 1,
  SHEIKHA_SAFETY_SYSTEM_CONTROL = 2,
  SHEIKHA_SAFETY_PHYSICAL_ACTUATION = 3,
  SHEIKHA_SAFETY_LIFE_CRITICAL = 4
};

enum sheikha_driver_resource_type {
  SHEIKHA_RESOURCE_NONE = 0,
  SHEIKHA_RESOURCE_MMIO = 1,
  SHEIKHA_RESOURCE_PORT_IO = 2,
  SHEIKHA_RESOURCE_IRQ = 3,
  SHEIKHA_RESOURCE_DMA_WINDOW = 4,
  SHEIKHA_RESOURCE_FIRMWARE_TABLE = 5
};

struct sheikha_device_identity {
  uint32_t bus_type;
  uint32_t class_code;
  uint32_t vendor_id;
  uint32_t device_id;
  uint32_t subsystem_id;
  uint32_t revision;
  uint64_t stable_instance_id;
};

struct sheikha_driver_resource {
  uint32_t type;
  uint32_t flags;
  uint64_t base;
  uint64_t length;
};

struct sheikha_driver_health {
  uint32_t lifecycle_state;
  int32_t last_status;
  uint64_t operations_completed;
  uint64_t operations_failed;
  uint64_t last_progress_tick;
};

struct sheikha_driver_request {
  uint64_t request_id;
  sheikha_driver_capability_mask_t requested_capabilities;
  uint64_t offset;
  uint64_t length;
  void *buffer;
};

typedef void (*sheikha_driver_audit_fn)(
  uint64_t request_id,
  int32_t status,
  sheikha_driver_capability_mask_t capabilities
);

struct sheikha_driver_context {
  uint32_t magic;
  uint32_t abi_version;
  uint32_t structure_size;
  uint32_t safety_class;
  sheikha_driver_capability_mask_t granted_capabilities;
  uint8_t human_approval_present;
  uint8_t physical_write_authorized;
  uint8_t firmware_write_authorized;
  uint8_t reserved;
  sheikha_driver_audit_fn audit;
};

struct sheikha_driver_ops {
  uint32_t abi_version;
  uint32_t structure_size;
  const char *driver_id;
  sheikha_driver_capability_mask_t declared_capabilities;
  int32_t (*probe)(
    struct sheikha_driver_context *context,
    const struct sheikha_device_identity *identity
  );
  int32_t (*bind)(
    struct sheikha_driver_context *context,
    const struct sheikha_driver_resource *resources,
    size_t resource_count
  );
  int32_t (*initialize)(struct sheikha_driver_context *context);
  int32_t (*start)(struct sheikha_driver_context *context);
  int32_t (*execute)(
    struct sheikha_driver_context *context,
    const struct sheikha_driver_request *request
  );
  int32_t (*quiesce)(struct sheikha_driver_context *context);
  int32_t (*recover)(struct sheikha_driver_context *context);
  int32_t (*health)(
    struct sheikha_driver_context *context,
    struct sheikha_driver_health *health
  );
  int32_t (*detach)(struct sheikha_driver_context *context);
};

static inline int32_t sheikha_driver_request_allowed(
  const struct sheikha_driver_context *context,
  const struct sheikha_driver_request *request
) {
  sheikha_driver_capability_mask_t high_impact;

  if (context == NULL || request == NULL) {
    return SHEIKHA_DRIVER_INVALID_ARGUMENT;
  }
  if (context->magic != SHEIKHA_DRIVER_CONTEXT_MAGIC ||
      context->abi_version != SHEIKHA_DRIVER_ABI_V1 ||
      context->structure_size < sizeof(*context)) {
    return SHEIKHA_DRIVER_INTEGRITY_ERROR;
  }
  if ((request->requested_capabilities &
       ~context->granted_capabilities) != 0u) {
    return SHEIKHA_DRIVER_DENIED;
  }

  high_impact = request->requested_capabilities &
    SHEIKHA_DRIVER_HIGH_IMPACT_MASK;
  if (high_impact != 0u && context->human_approval_present == 0u) {
    return SHEIKHA_DRIVER_NEEDS_APPROVAL;
  }
  if ((request->requested_capabilities &
       SHEIKHA_DRIVER_CAP_STORAGE_MUTATE) != 0u &&
      context->physical_write_authorized == 0u) {
    return SHEIKHA_DRIVER_DENIED;
  }
  if ((request->requested_capabilities &
       SHEIKHA_DRIVER_CAP_FIRMWARE_MUTATE) != 0u &&
      context->firmware_write_authorized == 0u) {
    return SHEIKHA_DRIVER_DENIED;
  }
  return SHEIKHA_DRIVER_OK;
}

#endif
