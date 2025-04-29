#pragma once
#include "CGLApplication.h"
#include "figure.h"

class CMyApplication : public CGLApplication
{
public:
    CMyApplication(const char* title);
    ~CMyApplication(void);
protected:
    // Перегружаем необходимые виртуальные методы родительского класса
    virtual void OnInit();
    virtual void OnDisplay(void);
    virtual void OnReshape(int width, int height);

public:

private:
    // Угол обзора по вертикали
    static const double FIELD_OF_VIEW;

    // Расстояние до ближней и дальней плоскостей отсечения
    static const double ZNEAR;
    static const double ZFAR;
};