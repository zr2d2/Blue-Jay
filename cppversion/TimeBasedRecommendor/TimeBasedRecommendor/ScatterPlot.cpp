#include "stdafx.h"
#include "ScatterPlot.h"
#include "Math.h"
#include <iostream>
using namespace std;

ScatterPlot::ScatterPlot(void)
{
}
void ScatterPlot::addDataPoint(Datapoint& datapoint)
{
	this->debugHistory.push_back(datapoint);
	//cout << "ScatterPlot adding a datapoint" << endl;
	// This implementation is slow! and will be made faster later
	this->datapoints.push_back(datapoint);
	int i;
	// search through the vector and insert it in the necessary place for it to remain sorted
	for (i = this->datapoints.size() - 1; i > 0; i--)
	{
		this->datapoints[i] = this->datapoints[i-1];
		if (this->datapoints[i].getX() <= datapoint.getX())
			break;
	}
	this->datapoints[i] = datapoint;
	//cout << "ScatterPlot done adding a datapoint" << endl;
}
Distribution ScatterPlot::predict(double x)
{
	cout << "ScatterPlot predicting with " << this->datapoints.size() << " datapoints and x= " << x << endl;
	// Make sure there are enough datapoints for a prediction
	if (this->datapoints.size() < 1)
	{
		return Distribution(0, 0, 0);
	}
	// find the location where x belongs
	int i;
	for (i = 0; i < (int)this->debugHistory.size(); i++)
	{
		cout << "x = " << debugHistory[i].getX() << " y = " << debugHistory[i].getY() << " weight = " << debugHistory[i].getWeight() << endl;
	}
	for (i = 0; i < (int)this->datapoints.size() - 1; i++)
	{
		if (datapoints[i].getX() >= x)
			break;
	}
	int middleIndex = i;
	int minIndex = middleIndex - int(sqrt((float)this->datapoints.size()) / 2);
	if (minIndex < 0)
		minIndex = 0;
	int maxIndex = minIndex + int(sqrt((float)this->datapoints.size()));
	int overshoot = maxIndex - (this->datapoints.size() - 1);
	if (overshoot > 0)
	{
		maxIndex -= overshoot;
		minIndex -= overshoot;
	}
	// Now compute the average and standard deviation of the points in this interval
	double sumY = 0;
	double sumY2 = 0;
	double n = 0;
	double weight, y;
	cout << "selecting relevant points" << endl;
	for (i = minIndex; i <= maxIndex; i++)
	{
		weight = this->datapoints[i].getWeight();
		y = this->datapoints[i].getY();
		cout << "x = " << datapoints[i].getX() << " y = " << y << endl;
		n += weight;
		sumY += y * weight;
		sumY2 += y * y * weight;
	}
	cout << "ScatterPlot using " << n << " datapoints" << endl;
	// Now we can compute the average and standard deviation
	double average = sumY / n;
	double stddev;
	if (n >= 2)
		stddev = sqrt((sumY2 - sumY * sumY / n) / (n - 1));
	else
		stddev = 0;
	Distribution result = Distribution(average, stddev, n);
	return result;
#if 0
	//double sX = 
	double sX = sqrt(sumX2 - sumX * sumX / numDataPoints);
	double sY = sqrt(sumY2 - sumY * sumY / numDataPoints);
	double uX = sumX / numDataPoints;
	double uY = sumY / numDataPoints;
	//double R = sum((x - uX) / sX * (y - uY) / sY) / n;
	//double R = sum((x - uX) * (y - uY)) / (n * sX * sY);
	//double R = (sumXY - uX * uY * n - uX * uY * n + uX * uY * n) / (n * sX * sY);
	double R = (sumXY / numDataPoints - uX * uY) / (sX * sY);
	double slope = R * sX / sY;
	double intercept = uY - slope * uX;
	//double sumErr2 = sum((y - (slope * x + intercept)) * (y - (slope * x + intercept)));
	//double sumErr2 = sum(y*y) - 2sum(y*slope*x+y*intercept) + sum((slope*x+intercept) * (slope*x+intercept))
	double sumErr2 = sumY2 - 2 * slope * sumXY - 2 * intercept * sumY + slope * slope * sumX2 + 2 * slope * intercept * sumX + numDataPoints * intercept * intercept;
	double guess = x * slope + intercept;
	Distribution result = Distribution(guess, sumErr2 / numDataPoints, numDataPoints);
	return result;
#endif
}
