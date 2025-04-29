#include "CMyApplication.h"
#include "sphere.h"
#include "CRocket.h"
#include "CFrame.h"
#include "COmniLight.h"

// Расстояние до ближней плоскости отсечения отображаемого объема
const double CMyApplication::ZNEAR = 0.5;
// Расстояние до дальей плоскости отсечения отображаемого объема
const double CMyApplication::ZFAR = 10;
// Угол обзора по вертикали
const double CMyApplication::FIELD_OF_VIEW = 60;
// Размер видимого объема, которые должен поместиться в порт просмотра
const double CMyApplication::FRUSTUM_SIZE = 2;
// Расстояние от камеры до точки вращения
const double CMyApplication::DISTANCE_TO_ORIGIN = 2;

CMyApplication::CMyApplication(const char* title, int width, int height)
    : CGLApplication(title, width, height)
    , m_windowWidth(width)
    , m_windowHeight(height)
    , m_leftButtonPressed(false)
    , m_mousePos(0.0, 0.0)
{
}

CMyApplication::~CMyApplication(void)
{
}

void CMyApplication::OnInit()
{
    // Задаем ширину линий
    glLineWidth(2);

    // Задаем цвет очистки буфера кадра
    glClearColor(1, 1, 1, 1);

    // Включаем тест глубины для удаления невидимых линий и поверхностей
    glEnable(GL_DEPTH_TEST);

    // Включаем режим отбраковки граней
    glEnable(GL_CULL_FACE);

    // Отбраковываться будут нелицевые стороны граней
    glCullFace(GL_BACK);

    // Сторона примитива считается лицевой, если при ее рисовании
    // обход верших осуществляется против часовой стрелки
    glFrontFace(GL_CCW);
}

void CMyApplication::OnDisplay(void)
{
    // Очищаем буфер цвета и буфер глубины
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();

    gluLookAt(
        2, 2, 2, // Положение глаза наблюдателя
        0, 0, 0, // Точка, в которую направлена камера
        0, 0, 1 // Вектор, служащий для определения вектора "вверх"
    );

    CRocket rocket;
    rocket.Draw({0, 0, -2});

    COmniLight light({ 1, 3, 3 });
    // копируем параметры источника света в OpenGL
    light.SetLight(GL_LIGHT0);
    // Включаем освещение и источник света
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);


    // Создаем координатный фрейм и рисуем его
    //CFrame frame;
    //frame.Draw();
    //glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
    //SetupCameraMatrix();
}

void CMyApplication::OnReshape(int width, int height)
{
    m_windowWidth = width;
    m_windowHeight = height;
    glViewport(0, 0, width, height);

    // Вычисляем соотношение сторон клиентской области окна
    double aspect = double(width) / double(height);

    // Считаем, что высота видимой области равна FRUSTUM_SIZE
    // (на расстоянии до ближней плоскости отсечения)
    double frustumHeight = FRUSTUM_SIZE;
    // Ширина видимой области рассчитывается согласно соотношению сторон окна
    // (шире окно - шире область видимости и наоборот)
    double frustumWidth = frustumHeight * aspect;

    // Если ширина видимой области получилась меньше, чем FRUSTUM_SIZE,
    // то корректируем размеры видимой области
    if (frustumWidth < FRUSTUM_SIZE && (aspect != 0))
    {
        frustumWidth = FRUSTUM_SIZE;
        frustumHeight = frustumWidth / aspect;
    }

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glFrustum(
        -frustumWidth * 0.5, frustumWidth * 0.5, // left, right
        -frustumHeight * 0.5, frustumHeight * 0.5, // top, bottom
        FRUSTUM_SIZE * 0.5, FRUSTUM_SIZE * 20 // znear, zfar
    );
    //gluPerspective(FIELD_OF_VIEW, aspect, ZNEAR, ZFAR);
    glMatrixMode(GL_MODELVIEW);
}

void CMyApplication::OnMouse(int button, int action, int x, int y)
{
    //if (button == GLFW_MOUSE_BUTTON_1)
    if (button == GLUT_LEFT_BUTTON)
    {
        //m_leftButtonPressed = (action & GLFW_PRESS) != 0;
        m_leftButtonPressed = (action == GLUT_DOWN); // GLUT_DOWN вместо GLFW_PRESS
        m_mousePos = { x, y }; // Обновляем позицию мыши
    }
}

void CMyApplication::OnMotion(double x, double y)
{
    const glm::dvec2 mousePos{ x, y };
    if (m_leftButtonPressed)
    {
        //const auto windowSize = glfwGetFramebufferSize(GetWindow(), &m_windowWidth, &m_windowHeight);

        const int width = m_windowWidth;
        const int height = m_windowHeight;

        const auto mouseDelta = mousePos - m_mousePos;
        //const double xAngle = mouseDelta.y * M_PI / windowSize.y;
        //const double yAngle = mouseDelta.x * M_PI / windowSize.x;
        const double xAngle = mouseDelta.y * M_PI / width;
        const double yAngle = mouseDelta.x * M_PI / height;
        RotateCamera(xAngle, yAngle);
    }
    m_mousePos = mousePos;
}

// Вращаем камеру вокруг начала кординат на заданный угол
void CMyApplication::RotateCamera(GLfloat rotateX, GLfloat rotateY)
{
    glRotatef(rotateX, 1, 0, 0);
    glRotatef(rotateY, 0, 1, 0);
}