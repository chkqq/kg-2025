#include <windows.h>
#include <windowsx.h>
#include <tchar.h>

const TCHAR CLASS_NAME[] = _T("MainWndClass");
const TCHAR WINDOW_TITLE[] = _T("Truck");

void OnDestroy(HWND /*hWnd*/)
{
    PostQuitMessage(0);
}

void OnPaint(HWND hwnd)
{
    PAINTSTRUCT ps;
    HDC dc = BeginPaint(hwnd, &ps);

    HPEN pen = CreatePen(PS_SOLID, 1, RGB(0, 0, 0));
    LOGBRUSH brushInfo;
    brushInfo.lbStyle = BS_SOLID;
    brushInfo.lbColor = RGB(128, 128, 128);
    brushInfo.lbHatch = 0;
    HBRUSH brush = CreateBrushIndirect(&brushInfo);

    HPEN oldPen = SelectPen(dc, pen);
    HBRUSH oldBrush = SelectBrush(dc, brush);

    // Кузов грузовика
    Rectangle(dc, 150, 210, 400, 235);

    // Кабина грузовика
    SelectBrush(dc, oldBrush);
    DeleteBrush(brush);
    brushInfo.lbColor = RGB(255, 0, 0);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);

    Rectangle(dc, 300, 110, 400, 210);

    // Окна кабины
    brushInfo.lbColor = RGB(173, 216, 230);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);
    Rectangle(dc, 335, 120, 400, 160);

    // Дверь кабины
    brushInfo.lbColor = RGB(255, 0, 0);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);
    Rectangle(dc, 335, 160, 400, 200);

    // Колеса
    // Шины
    brushInfo.lbColor = RGB(0, 0, 0);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);
    Ellipse(dc, 170, 200, 230, 260); // Переднее колесо
    Ellipse(dc, 330, 200, 390, 260); // Задняя шина

    brushInfo.lbColor = RGB(128, 128, 128);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);
    Ellipse(dc, 180, 210, 220, 250); // Передняя шина
    Ellipse(dc, 340, 210, 380, 250);  // Задняя шина

    // Труба
    SelectBrush(dc, oldBrush);
    DeleteBrush(brush);
    brushInfo.lbColor = RGB(128, 128, 128);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);
    Rectangle(dc, 285, 80, 300, 210);



    // Завершаем рисование
    SelectPen(dc, oldPen);
    DeletePen(pen);
    DeleteBrush(brush);

    EndPaint(hwnd, &ps);
}

LRESULT CALLBACK WindowProc(
    HWND hwnd,
    UINT uMsg,
    WPARAM wParam,
    LPARAM lParam)
{
    switch (uMsg)
    {
        HANDLE_MSG(hwnd, WM_DESTROY, OnDestroy);
        HANDLE_MSG(hwnd, WM_PAINT, OnPaint);
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

bool RegisterWndClass(HINSTANCE hInstance)
{
    WNDCLASSEX wndClass =
    {
        sizeof(wndClass),
        CS_HREDRAW | CS_VREDRAW,
        &WindowProc,
        0,
        0,
        hInstance,
        NULL,
        LoadCursor(NULL, IDC_ARROW),
        (HBRUSH)(COLOR_BTNFACE + 1),
        NULL,
        CLASS_NAME,
        NULL,
    };
    return RegisterClassEx(&wndClass) != FALSE;
}

HWND CreateMainWindow(HINSTANCE hInstance)
{
    HWND hMainWindow = CreateWindowEx(
        0,
        CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        CW_USEDEFAULT, CW_USEDEFAULT,
        NULL,
        NULL,
        hInstance,
        NULL);

    return hMainWindow;
}

int MainLoop()
{
    MSG msg;
    BOOL res;
    while ((res = GetMessage(&msg, NULL, 0, 0)) != 0)
    {
        if (res == -1)
        {
            return 1;
        }
        else
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }
    return msg.wParam;
}

int WINAPI WinMain(
    HINSTANCE hInstance,
    HINSTANCE,
    LPSTR,
    int nCmdShow)
{
    if (!RegisterWndClass(hInstance))
        return 1;

    HWND hMainWindow = CreateMainWindow(hInstance);
    if (!hMainWindow)
        return 1;

    ShowWindow(hMainWindow, nCmdShow);
    UpdateWindow(hMainWindow);

    return MainLoop();
}
