#pragma once
#include <GL/glut.h>

class CFrame
{
public:
    // Инициализация координатного фрейма
    // size - длина стрелки,
    CFrame(float size = 1, float endSize = 0.1);
    // Рисуем координатные оси
    void Draw(void)const;
private:
    float m_size;
    float m_endSize;
};

CFrame::CFrame(float size, float endSize)
    :m_size(size)
    , m_endSize(endSize)
{
}

void CFrame::Draw(void)const
{
    float arrowOffset = m_size * m_endSize;
    float arrowOffset2 = arrowOffset * 0.5;

    glBegin(GL_LINES);
    // Ось X
    {
        glColor3ub(255, 0, 0);

        // Рисуем ось X
        glVertex3f(0, 0, 0);
        glVertex3f(m_size, 0, 0);
        // Рисуем наконечник оси X
        glVertex3f(m_size, 0, 0);
        glVertex3f(m_size - arrowOffset, -arrowOffset2, 0);
        glVertex3f(m_size, 0, 0);
        glVertex3f(m_size - arrowOffset, +arrowOffset2, 0);
    }
    // Ось Y
    {
        glColor3ub(0, 255, 0);

        // Рисуем ось Y
        glVertex3f(0, 0, 0);
        glVertex3f(0, m_size, 0);
        // Рисуем наконечник оси Y
        glVertex3f(0, m_size, 0);
        glVertex3f(-arrowOffset2, m_size - arrowOffset, 0);
        glVertex3f(0, m_size, 0);
        glVertex3f(+arrowOffset2, m_size - arrowOffset, 0);
    }
    // Ось Z
    {
        glColor3ub(0, 0, 255);
        // Рисуем ось Z
        glVertex3f(0, 0, 0);
        glVertex3f(0, 0, m_size);
        // Рисуем наконечник оси Z
        glVertex3f(0, 0, m_size);
        glVertex3f(-arrowOffset2, 0, m_size - arrowOffset);
        glVertex3f(0, 0, m_size);
        glVertex3f(+arrowOffset2, 0, m_size - arrowOffset);
    }
    glEnd();
}