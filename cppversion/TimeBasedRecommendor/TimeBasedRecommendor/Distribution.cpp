#include "stdafx.h"
#include "Distribution.h"
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