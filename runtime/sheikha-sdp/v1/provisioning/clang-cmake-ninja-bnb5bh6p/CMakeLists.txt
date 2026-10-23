cmake_minimum_required(VERSION 3.22)
project(SheikhaCoreToolchainCheck LANGUAGES C)
add_executable(sheikha-check program.c)
target_compile_options(sheikha-check PRIVATE -Wall -Wextra -Werror)
