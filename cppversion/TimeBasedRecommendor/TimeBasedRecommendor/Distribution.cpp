#include "stdafx.h"
#include "Distribution.h"

// the Distribution class represents a summary of a collection of floating-point numbers
// it stores average, spread, and count (although even count may be fractional)
Distribution::Distribution(void)
{
	this->mean = this->standardDeviation = this->weight = 0;
}
Distribution::Distribution(double average, double stdDev, double relativeWeight)
{
	this->mean = average;
	this->standardDeviation = stdDev;
	this->weight = relativeWeight;
}
double Distribution::getMean(void)
{
	return this->mean;
}
double Distribution::getStdDev(void)
{
	return this->standardDeviation;
}
double Distribution::getWeight(void)
{
	return this->weight;
}