#ifndef SHEIKHA_SERIAL_H
#define SHEIKHA_SERIAL_H

void sheikha_serial_init(void);
void sheikha_serial_write(const char *text);
void sheikha_serial_write_line(const char *text);

#endif
