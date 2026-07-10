NODE ?= node
PIPELINE := build/sheikha-bare-metal-pipeline-v1.js

.PHONY: all toolchain clean build image qemu verify evidence

all:
	$(NODE) $(PIPELINE) all

toolchain:
	$(NODE) $(PIPELINE) toolchain

clean:
	$(NODE) $(PIPELINE) clean

build:
	$(NODE) $(PIPELINE) build

image:
	$(NODE) $(PIPELINE) image

qemu:
	$(NODE) $(PIPELINE) qemu

verify:
	$(NODE) $(PIPELINE) verify

evidence: verify
