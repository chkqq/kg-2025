#include "CMyApplication.h"

CMyApplication app("task4");
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
    app.MainLoop(); // Запускаем приложение
    return 0;
}