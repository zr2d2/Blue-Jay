#ifndef _PREDICTION_LINK_H_
#define _PREDICTION_LINK_H_

#include "RatingMovingAverage.h"
#include "ParticipationMovingAverage.h"
#include "Distribution.h"
#include "ScatterPlot.h"

// The PredictionLink class is used to estimate the rating that will be given to another song (or category) based on an attribute of another song (or category)
class PredictionLink
{
public:
	PredictionLink(void);
	PredictionLink(MovingAverage* input, RatingMovingAverage* output);
	void initializeDecreasing(void);	// initializes it with the suspicion that there is a strong positive correlation
	void update(void);
	//Distribution guess(void);
	Distribution guess(DateTime when);
private:
	MovingAverage* inputData;
	RatingMovingAverage* outputData;
	ScatterPlot plot;
	DateTime latestUpdateTime;
	double numChanges;	// keep track of how many times the input changes so we know how much weight to attribute to this PredictionLink
};

#endif