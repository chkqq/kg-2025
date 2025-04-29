#include "CRocket.h"
#include <cmath>

void CRocket::Draw(const glm::vec3& pos)
{
    m_position = pos;

    glPushMatrix();
    glTranslatef(m_position.x, m_position.y, m_position.z);

    DrawBody();
    DrawNozzles();
    DrawNose();

    glPopMatrix();
}

void CRocket::DrawBody() {
    GLUquadric* quadric = gluNewQuadric();
    gluQuadricDrawStyle(quadric, GLU_FILL);
    glColor3f(0.8, 0.8, 0.8);

    gluCylinder(quadric, m_radius, m_radius, m_height * 0.8, 32, 1);
    gluDeleteQuadric(quadric);
}

void CRocket::DrawNose() {
    GLUquadric* quadric = gluNewQuadric();
    glColor3f(1.0f, 0.0f, 0.0f);

    glTranslatef(0, 0, m_height * 0.8);
    gluCylinder(quadric, m_radius, 0.0, m_height * 0.2, 32, 1);
    gluDeleteQuadric(quadric);
}

void CRocket::DrawNozzles() {
    GLUquadric* quadric = gluNewQuadric();
    glColor3f(0.3, 0.3, 0.3);

    for (int i = 0; i < 4; ++i) {
        glPushMatrix();

        glRotatef(i * 90.0, 0, 0, 1);
        glTranslatef(m_radius, 0, -m_nozzleLength * 0.1);

        gluCylinder(quadric,
            m_nozzleRadius,
            m_nozzleRadius * 0.7,
            m_nozzleLength * 0.6,
            16, 1);

        glTranslatef(0, 0, m_nozzleLength * 0.6);

        gluCylinder(quadric,
            m_nozzleRadius * 0.7,
            m_nozzleRadius * 0,
            m_nozzleLength * 0.4,
            16, 1);

        glPopMatrix();
    }
    gluDeleteQuadric(quadric);
}