#ifndef _MOVING_AVERAGE_H_
#define _MOVING_AVERAGE_H_

#include "DateTime.h"
#include <vector>
#include "Rating.h"
#include "Participation.h"
#include "Distribution.h"
#include "Datapoint.h"

class RatingMovingAverage;

class MovingAverage
{
public:
	MovingAverage(void);
	virtual Distribution getValueAt(DateTime when, bool strictlyEarlier);
	std::vector<Datapoint> getCorrelationsFor(RatingMovingAverage& other, DateTime startTime);
	//DateTime getLatestRatingDate(void);
	void setName(Name newName);
	Name getName(void);
	//int getNumRatings(void);
//protected:
	//void assignRating(Rating newRating);
private:
	Name name;
};
#endif