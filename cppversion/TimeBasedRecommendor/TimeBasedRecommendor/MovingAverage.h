#ifndef _MOVING_AVERAGE_H_
#define _MOVING_AVERAGE_H_

#include "DateTime.h"
#include <vector>
#include "Rating.h"
#include "Participation.h"
#include "Distribution.h"
#include "Datapoint.h"

class Candidate;
class RatingMovingAverage;

class MovingAverage
{
public:
	MovingAverage(void);
	virtual std::pair<Distribution, int> getValueAt(DateTime when, bool strictlyEarlier);
	virtual Distribution getCurrentValue(DateTime when, bool strictlyEarlier);
	// the vector returned is the relevant datapoints and the double is the additional weight contributed by these datapoints
	std::pair<std::vector<Datapoint>, double> getCorrelationsFor(RatingMovingAverage& other, DateTime startTime);
	//DateTime getLatestRatingDate(void);
	void setName(Name newName);
	Name getName(void);
	void setOwnerName(Name newName);
	Name getOwnerName(void);
	virtual bool isAParticipationMovingAverage(void);		// for determining if its type is ParticipationMovingAverage or not
	virtual DateTime getLatestDate(void);
	//int getNumRatings(void);
//protected:
	//void assignRating(Rating newRating);
private:
	Name name;
	Name ownerName;
};
#endif