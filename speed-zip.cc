#include "zip.h"
#include <stdio.h>
#include <iostream>
#include <chrono>
#include <fstream>

typedef int (*on_extract)(const char *filename, void *arg);
using namespace std;

int main()
{
    printf("step1 \n");
    ifstream infile;

    // 打开文件
    infile.open("smallZip.zip", std::ios::in | std::ios::binary);
    infile.seekg(0, std::ios::end);
    // 文件大小
    size_t file_size_in_byte = infile.tellg();
    char *xcode = (char *)malloc(sizeof(char) * file_size_in_byte);
    infile.seekg(0, std::ios::beg);
    // 读取文件到内存
    infile.read(xcode, file_size_in_byte);

    printf("step2 %zu \n", file_size_in_byte);
    auto begin = std::chrono::high_resolution_clock::now();
    int arg = 2;

    on_extract fun1 = [](const char *filename, void *arg)
    { return 0; };
    // 解压
    // int code = zip_extract("test.zip", "./tmp", fun1, &arg);
    int code = zip_stream_extract(xcode, file_size_in_byte, "./tmp", fun1, &arg);

    auto end = std::chrono::high_resolution_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::nanoseconds>(end - begin);

    printf("Time measured: %.3f seconds.\n", elapsed.count() * 1e-9);
}
