#include "CMyApplication.h"

CMyApplication app("task4", 600, 400);
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
    app.MainLoop(); // Запускаем приложение
    return 0;
}