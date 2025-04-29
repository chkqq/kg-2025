#pragma once
#include "CLight.h"

class CDirectLight : public CLight
{
public:
    CDirectLight(CVector3f const& lightDirection = CVector3f(0, 0, 1));

    void SetDirection(CVector3f const& direction);

    void SetLight(GLenum light) const;
private:
    CVector3f m_direction;
};

CDirectLight::CDirectLight(CVector3f const& lightDirection)
    : m_direction(lightDirection)
{
}

void CDirectLight::SetLight(GLenum light) const
{
    GLfloat lightDirection[4] =
    {
        m_direction.x,
        m_direction.y,
        m_direction.z,
        0
    };
    glLightfv(light, GL_POSITION, lightDirection);
    CLight::SetLight(light);
}

void CDirectLight::SetDirection(CVector3f const& direction)
{
    m_direction = direction;
}