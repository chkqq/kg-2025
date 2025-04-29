#pragma once
#include <GL/glut.h>
#include <glm/glm.hpp>

class CRocket
{
public:
    void Draw(const glm::vec3& pos);

private:
    void DrawBody();
    void DrawNose();
    void DrawNozzles();

    glm::vec3 m_position{ 0, 0, 0 };
    double m_height = 4;
    double m_radius = 0.5;
    float m_nozzleRadius = 0.4;
    float m_nozzleLength = 2.4;
};