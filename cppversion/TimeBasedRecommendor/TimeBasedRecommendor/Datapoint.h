#ifndef _DATAPOINT_H_
#define _DATAPOINT_H_

// simple class with x, y, and weight
class Datapoint
{
public:
	Datapoint(double x, double y, double weight);
	double getX(void);
	double getY(void);
	double getWeight(void);
private:
	double itsX, itsY, itsWeight;
};

#endif