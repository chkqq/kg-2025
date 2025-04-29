#pragma once
#include <GL/glut.h>
#include <math.h>
#include <numbers>
#include "CVector3.h"
#define M_PI 3.14159265358979323846

class CSphere
{
public:
    CSphere(
        float radius,
        unsigned slices,
        unsigned stacks)
        : m_radius(radius)
        , m_slices(slices)
        , m_stacks(stacks)
        , m_displayList(0)
    {
    };
    ~CSphere()
    {
        if (m_displayList)
        {
            glDeleteLists(m_displayList, 1);
        }
    };

    void Draw() const
    {
        if (!m_displayList)
        {
            m_displayList = glGenLists(1);
            glNewList(m_displayList, GL_COMPILE);

            DrawSphere();

            glEndList();
        }
        glCallList(m_displayList);
    };

private:
    void DrawSphere() const
    {
        // шаг по параллелям
        const float stackStep = static_cast<float>(std::numbers::pi / m_stacks);

        // шаг по меридианам
        const float sliceStep = static_cast<float>(2 * std::numbers::pi / m_slices);

        // начальный угол по параллелям
        for (unsigned stack = 0; stack < m_stacks; ++stack)
        {
            float stackAngle = static_cast<float>(std::numbers::pi * 0.5 - stack * stackStep);
            float nextStackAngle = stackAngle - stackStep;

            const float stackRadius = m_radius * cosf(stackAngle);
            const float nextStackRadius = m_radius * cosf(nextStackAngle);
            const float z0 = m_radius * sinf(stackAngle);
            const float z1 = m_radius * sinf(nextStackAngle);

            glBegin(GL_TRIANGLE_STRIP);
            // цикл по меридианам
            for (unsigned slice = 0; slice <= m_slices; ++slice)
            {
                // вычисляем угол, текущего меридиана
                float sliceAngle = (slice != m_slices) ? slice * sliceStep : 0;

                // Вычисляем координаты на текущей параллели
                float x0 = stackRadius * cosf(sliceAngle);
                float y0 = stackRadius * sinf(sliceAngle);
                // вычисляем и задаем вектор нормали, текстурные координаты
                // и положение вершины в пространстве
                CVector3f normal0_v(x0, y0, z0);
                normal0_v.Normalize();
                GLfloat normal0[3] = { normal0_v.x, normal0_v.y, normal0_v.z };
                glNormal3fv(normal0);
                glTexCoord2f(float(slice) / m_slices, float(stack) / m_stacks);
                glVertex3f(x0, y0, z0);

                float x1 = nextStackRadius * cosf(sliceAngle);
                float y1 = nextStackRadius * sinf(sliceAngle);
                CVector3f normal1_v(x1, y1, z1);
                normal1_v.Normalize();
                GLfloat normal1[3] = { normal1_v.x, normal1_v.y, normal1_v.z };
                glNormal3fv(normal1);
                glTexCoord2f(float(slice) / m_slices, float(stack + 1) / m_stacks);
                glVertex3f(x1, y1, z1);
            }
            glEnd();
        };
    };

    // Идентификатор дисплейного списка, выполняющего рисование сферы
    mutable GLuint m_displayList;
    float m_radius; // радиус
    unsigned m_slices; // количество меридианов
    unsigned m_stacks; // количество параллелей
};