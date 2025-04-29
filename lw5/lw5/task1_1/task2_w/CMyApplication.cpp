#include "CMyApplication.h"

// Расстояние до ближней плоскости отсечения отображаемого объема
const double CMyApplication::ZNEAR = 0.5;
// Расстояние до дальей плоскости отсечения отображаемого объема
const double CMyApplication::ZFAR = 10;
// Угол обзора по вертикали
const double CMyApplication::FIELD_OF_VIEW = 60;

CMyApplication::CMyApplication(const char* title)
    : CGLApplication(title, 600, 400)
{
}

CMyApplication::~CMyApplication(void)
{
}

void CMyApplication::OnInit()
{
    // Включаем режим отбраковки граней
    glEnable(GL_CULL_FACE);

    // Отбраковываться будут нелицевые стороны граней
    glCullFace(GL_BACK);

    // Сторона примитива считается лицевой, если при ее рисовании
    // обход верших осуществляется против часовой стрелки
    glFrontFace(GL_CCW);

    // Включаем тест глубины для удаления невидимых линий и поверхностей
    glEnable(GL_DEPTH_TEST);

    // Задаем цвет очистки буфера кадра
    glClearColor(1, 1, 1, 1);
}

void CMyApplication::OnDisplay(void)
{
    // Очищаем буфер цвета и буфер глубины
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();

    static float angle = 0.0;
    angle += 0.5f;

    gluLookAt(
        1.5, 1.5, 2, // Положение глаза наблюдателя
        0, 0, 0, // Точка, в которую направлена камера
        0, 1, 0 // Вектор, служащий для определения вектора "вверх"
    );
    //glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
}

void CMyApplication::OnReshape(int width, int height)
{
    glViewport(0, 0, width, height);

    // Вычисляем соотношение сторон клиентской области окна
    double aspect = double(width) / double(height);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(FIELD_OF_VIEW, aspect, ZNEAR, ZFAR);
    glMatrixMode(GL_MODELVIEW);
}