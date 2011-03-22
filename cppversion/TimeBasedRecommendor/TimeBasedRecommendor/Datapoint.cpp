#include "stdafx.h"
#include "Datapoint.h"
#include <iostream>

using namespace std;

Datapoint::Datapoint(double x, double y, double weight)
{
	this->itsX = x;
	this->itsY = y;
	this->itsWeight = weight;
}
double Datapoint::getX(void)
{
	return this->itsX;
}
double Datapoint::getY(void)
{
	return this->itsY;
}
double Datapoint::getWeight(void)
{
	return this->itsWeight;
}