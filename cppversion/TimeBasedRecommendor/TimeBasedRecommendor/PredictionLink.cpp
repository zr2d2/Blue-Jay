#include "stdafx.h"
#include "PredictionLink.h"
#include <vector>
#include <iostream>
#include "Math.h"
#include "Candidate.h"
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
	//this->latestUpdateTime = DateTime("1970-01-01T00:00:00");
#if 1
	// check whether this link is predicting something from its own past history
	if (input->getOwnerName() == output->getOwnerName())
	{
		//cout << "same owner for " << input->getName().getName() << " and " << output->getName().getName() << endl;
		//cout << "owner is " << input->getOwnerName().getName() << endl;

		// check whether this link is using the participation history
		if (input->isAParticipationMovingAverage())
		{
			// If we get here then we're predicting the score of a Candidate based on its past frequency
			// Usually, if something has happened a lot recently then it will be boring in the future
			//this->initializeDecreasing();
		}
	}
#endif
}
// The point of this function is to call it on the PredictionLink that predicts the rating of a song based on its frequency
// This way, when we don't have much data, we assume that it is undesirable to hear a song that was heard recently
void PredictionLink::initializeDecreasing(void)
{
	//cout << "initializing decreasing" << endl;
	double intensity = 1;
	int numPoints = 40;
	int i;
	double score;
	double duration;
	// setup with the initial suspicion that a song isn't as good if it was heard recently
	for (i = 0; i < numPoints; i++)
	{
		duration = (double)i * 1500.0;
		intensity = 1.0 / duration;
		score = sqrt(duration) / 500;
		this->plot.addDataPoint(Datapoint(intensity, score, 1));
	}
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

// compute a distribution that represents the expected deviation from the overall mean
Distribution PredictionLink::guess(DateTime when)
{
	cout << "PredictionLink::guess" << endl;
	//DateTime when = this->outputData->getLatestRatingDate();
	//cout << " latest rating date = " << when.stringVersion() << endl;
	Distribution input = this->inputData->getValueAt(when, false);
	Distribution middle = this->plot.predict(input.getMean());
	//return middle;
	cout << "x = " << input.getMean();
	cout << "middle=" << middle.getMean();
	Distribution leftOneStdDev = this->plot.predict(input.getMean() - input.getStdDev());
	cout << " left = " << leftOneStdDev.getMean();
	Distribution rightOneStdDev = this->plot.predict(input.getMean() + input.getStdDev());
	cout << " right = " << rightOneStdDev.getMean();
	//double overallMean = this->outputData->getAverageValue();
	double stdDevA = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2;
	double stdDevB = middle.getStdDev();
	double stdDev = sqrt(stdDevA * stdDevA + stdDevB * stdDevB);
	//Distribution result(middle.getMean(), stdDev, this->outputData->getNumRatings());
	//Distribution result(middle.getMean(), stdDev, this->plot.getNumPoints());
	Distribution result(middle.getMean(), stdDev, middle.getWeight());
	cout << endl;
	return result;
}
/*Distribution PredictionLink::guess(DateTime when)
{
	double x = this->inputData->getValueAt(when, false);
	Distribution result = this->plot.predict(x);
	return result;
}*/