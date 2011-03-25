#include "stdafx.h"
#include "PredictionLink.h"
#include <vector>
#include <iostream>
#include "Math.h"
using namespace std;

PredictionLink::PredictionLink(void)
{
	//cout << "Error; the default PredictionLink constructor should not be called";
}

// The PredictionLink class attempts to predict the value of one MovingAverage from the value of another
PredictionLink::PredictionLink(MovingAverage* input, RatingMovingAverage* output)
{
	this->inputData = input;
	this->outputData = output;
	this->latestUpdateTime = DateTime("1970-01-01T00:00:00");
}

void PredictionLink::update(void)
{
	//cout << "adding a point to a PredictionLink" << endl;
	// get all of the datapoints that were added since the latest update
	vector<Datapoint> newPoints = this->inputData->getCorrelationsFor(*(this->outputData), this->latestUpdateTime);
	if (newPoints.size() > 0)
	{
		// put them into the scatterplot
		unsigned int i;
		for (i = 0; i < newPoints.size(); i++)
		{
			//cout << "adding a point to a PredictionLink" << endl;
			this->plot.addDataPoint(newPoints[i]);
		}
		// update the latest update time
		this->latestUpdateTime = this->outputData->getLatestRatingDate();
	}
}

Distribution PredictionLink::guess(void)
{
	cout << "PredictionLink::guess" << endl;
	DateTime when = this->outputData->getLatestRatingDate();
	cout << " latest rating date = " << when.stringVersion() << endl;
	Distribution input = this->inputData->getValueAt(when, false);
	Distribution middle = this->plot.predict(input.getMean());
	cout << endl;
	return middle;
	cout << "middle=" << middle.getMean();
	Distribution rightOneStdDev = this->plot.predict(input.getMean() + input.getStdDev());
	Distribution leftOneStdDev = this->plot.predict(input.getMean() - input.getStdDev());
	double stdDevA = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2;
	double stdDevB = middle.getStdDev();
	double stdDev = sqrt(stdDevA * stdDevA + stdDevB * stdDevB);
	Distribution result(middle.getMean(), stdDev, this->outputData->getNumRatings());
	cout << endl;
	return result;
}
/*Distribution PredictionLink::guess(DateTime when)
{
	double x = this->inputData->getValueAt(when, false);
	Distribution result = this->plot.predict(x);
	return result;
}*/