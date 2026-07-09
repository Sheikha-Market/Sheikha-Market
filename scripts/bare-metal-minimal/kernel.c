void kernel_main(void) {
    volatile char* video_memory = (volatile char*)0xB8000;
    const char* message = "Al-Thabat min Allah";

    for (int i = 0; message[i] != '\0'; i++) {
        video_memory[i * 2] = message[i];
        video_memory[i * 2 + 1] = 0x07;
    }
}
