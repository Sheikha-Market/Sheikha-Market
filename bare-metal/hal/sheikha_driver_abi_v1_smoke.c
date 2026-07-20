#include "sheikha_driver_abi_v1.h"

static int expect_status(int32_t actual, int32_t expected) {
  return actual == expected ? 0 : 1;
}

int main(void) {
  struct sheikha_driver_context context = {
    .magic = SHEIKHA_DRIVER_CONTEXT_MAGIC,
    .abi_version = SHEIKHA_DRIVER_ABI_V1,
    .structure_size = sizeof(struct sheikha_driver_context),
    .safety_class = SHEIKHA_SAFETY_DATA_PATH,
    .granted_capabilities =
      SHEIKHA_DRIVER_CAP_DISCOVER | SHEIKHA_DRIVER_CAP_READ,
    .human_approval_present = 0u,
    .physical_write_authorized = 0u,
    .firmware_write_authorized = 0u,
    .reserved = 0u,
    .audit = 0,
  };
  struct sheikha_driver_request request = {
    .request_id = 1u,
    .requested_capabilities = SHEIKHA_DRIVER_CAP_DISCOVER,
    .offset = 0u,
    .length = 0u,
    .buffer = 0,
  };

  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_OK
      ) != 0) return 1;

  request.requested_capabilities = SHEIKHA_DRIVER_CAP_WRITE;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_DENIED
      ) != 0) return 2;

  context.granted_capabilities |= SHEIKHA_DRIVER_CAP_WRITE;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_NEEDS_APPROVAL
      ) != 0) return 3;

  context.human_approval_present = 1u;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_OK
      ) != 0) return 4;

  context.granted_capabilities |= SHEIKHA_DRIVER_CAP_STORAGE_MUTATE;
  request.requested_capabilities = SHEIKHA_DRIVER_CAP_STORAGE_MUTATE;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_DENIED
      ) != 0) return 5;

  context.physical_write_authorized = 1u;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_OK
      ) != 0) return 6;

  context.granted_capabilities |= SHEIKHA_DRIVER_CAP_FIRMWARE_MUTATE;
  request.requested_capabilities = SHEIKHA_DRIVER_CAP_FIRMWARE_MUTATE;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_DENIED
      ) != 0) return 7;

  context.firmware_write_authorized = 1u;
  if (expect_status(
        sheikha_driver_request_allowed(&context, &request),
        SHEIKHA_DRIVER_OK
      ) != 0) return 8;

  return 0;
}
