#ifndef _DISTRIBUTION_H_
#define _DISTRIBUTION_H_

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