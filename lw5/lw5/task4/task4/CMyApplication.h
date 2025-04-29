#pragma once
#include "CGLApplication.h"
#include <glm/glm.hpp>
#include <GLFW/glfw3.h>

class CMyApplication : public CGLApplication
{
public:
    CMyApplication(const char* title, int width, int height);
    ~CMyApplication(void);
protected:
    // Перегружаем необходимые виртуальные методы родительского класса
    virtual void OnInit();
    virtual void OnDisplay(void);
    virtual void OnReshape(int width, int height);

public:

private:
    // Размеры окна
    int m_windowWidth;
    int m_windowHeight;

    // Размер видимой области (по вертикали и горизонтали)
    static const double FRUSTUM_SIZE;

    // Расстояние от камеры до центра координатной оси
    static const double DISTANCE_TO_ORIGIN;

    // Угол обзора по вертикали
    static const double FIELD_OF_VIEW;

    // Расстояние до ближней и дальней плоскостей отсечения
    static const double ZNEAR;
    static const double ZFAR;


    void OnMouse(int button, int action, int x, int y) override;
    void OnMotion(double x, double y) override;
    // Вращаем камеру вокруг начала координат
    void RotateCamera(GLfloat rotateX, GLfloat rotateY);
    // Флаг, свидетельствующий о состоянии левой кнопки мыши
    bool m_leftButtonPressed;
    glm::dvec2 m_mousePos;
};