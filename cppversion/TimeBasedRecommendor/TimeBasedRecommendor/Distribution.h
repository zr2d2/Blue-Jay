#ifndef _DISTRIBUTION_H_
#define _DISTRIBUTION_H_

// the Distribution class represents a summary of a collection of floating-point numbers
// it stores average, spread, and count (although even count may be fractional)
class Distribution
{
public:
	Distribution(void);
	Distribution(double average, double stdDev, double relativeWeight);
	double getMean(void);
	double getStdDev(void);
	double getWeight(void);
private:
	double mean;
	double standardDeviation;
	double weight;
};

#endif