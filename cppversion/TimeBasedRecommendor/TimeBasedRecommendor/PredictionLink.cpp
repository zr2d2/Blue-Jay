#include "stdafx.h"
#include "PredictionLink.h"
#include <vector>
#include <iostream>
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
	DateTime when = this->outputData->getLatestRatingDate();
	double x = this->inputData->getValueAt(when, false);
	return this->plot.predict(x);
}
/*Distribution PredictionLink::guess(DateTime when)
{
	double x = this->inputData->getValueAt(when, false);
	Distribution result = this->plot.predict(x);
	return result;
}*/