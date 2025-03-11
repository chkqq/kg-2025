#include <windows.h>
#include <windowsx.h>
#include <tchar.h>

const TCHAR CLASS_NAME[] = _T("MainWndClass");
const TCHAR WINDOW_TITLE[] = _T("IRM");

void OnDestroy(HWND /*hWnd*/)
{
    PostQuitMessage(0);
}

void OnPaint(HWND hwnd)
{
    PAINTSTRUCT ps;
    HDC dc = BeginPaint(hwnd, &ps);

    HPEN pen = CreatePen(PS_SOLID, 5, RGB(0, 0, 0));
    LOGBRUSH brushInfo;
    brushInfo.lbStyle = BS_SOLID;
    brushInfo.lbColor = RGB(113, 96, 232);
    brushInfo.lbHatch = 0;
    HBRUSH brush = CreateBrushIndirect(&brushInfo);

    HPEN oldPen = SelectPen(dc, pen);
    HBRUSH oldBrush = SelectBrush(dc, brush);

    // I
    Rectangle(dc, 20, 20, 40, 220);

    SelectBrush(dc, oldBrush);
    DeleteBrush(brush);

    brushInfo.lbColor = RGB(242, 63, 67);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);

    // R
    Rectangle(dc, 60, 20, 80, 220);
    POINT pointsR1[4] = { {80, 20}, {140, 20}, {120, 100}, {80, 100} };
    Polygon(dc, pointsR1, 4);
    POINT pointsR2[4] = { {80, 100}, {120, 220}, {100, 220}, {80, 120} };
    Polygon(dc, pointsR2, 4);

    SelectBrush(dc, oldBrush);
    DeleteBrush(brush);

    brushInfo.lbColor = RGB(220, 220, 170);
    brush = CreateBrushIndirect(&brushInfo);
    oldBrush = SelectBrush(dc, brush);

    // M
    POINT pointsM1[4] = { {160, 220}, {180, 20}, {200, 20}, {180, 220} };
    Polygon(dc, pointsM1, 4);
    POINT pointsM2[4] = { {200, 220}, {220, 20}, {240, 20}, {220, 220} };
    Polygon(dc, pointsM2, 4);
    POINT pointsM3[4] = { {180, 20}, {190, 220}, {210, 220}, {200, 20} };
    Polygon(dc, pointsM3, 4);
    POINT pointsM4[4] = { {220, 20}, {230, 220}, {250, 220}, {240, 20} };
    Polygon(dc, pointsM4, 4);


    SelectPen(dc, oldPen);
    SelectBrush(dc, oldBrush);
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
        sizeof(wndClass), //UINT cbSize;
        CS_HREDRAW | CS_VREDRAW, //UINT style;
        &WindowProc, //WNDPROC lpfnWndProc;
        0, //int cbClsExtra;
        0, //int cbWndExtra;
        hInstance, //HINSTANCE hInstance;
        NULL, //HICON hIcon;
        LoadCursor(NULL, IDC_ARROW), //HCURSOR hCursor;
        (HBRUSH)(COLOR_BTNFACE + 1), //HBRUSH hbrBackground;
        NULL, //LPCTSTR lpszMenuName;
        CLASS_NAME, //LPCTSTR lpszClassName;
        NULL, //HICON hIconSm;
    };
    return RegisterClassEx(&wndClass) != FALSE;
}

HWND CreateMainWindow(HINSTANCE hInstance)
{
    HWND hMainWindow = CreateWindowEx(
        0,                              // расширенные стили окна
        CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW,            // стили окна
        CW_USEDEFAULT, CW_USEDEFAULT,   // координаты по-умолчанию
        CW_USEDEFAULT, CW_USEDEFAULT,   // размер по умолчанию
        NULL,                           // дескриптор родительского окна
        NULL,                           // дескриптор меню
        hInstance,
        NULL);                          // доп. параметры окна

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
    HINSTANCE,//hPrevInstance,
    LPSTR,//lpCmdLine,
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
