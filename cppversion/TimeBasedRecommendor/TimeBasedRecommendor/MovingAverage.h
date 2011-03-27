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
	virtual Distribution getValueAt(DateTime when, bool strictlyEarlier);
	std::vector<Datapoint> getCorrelationsFor(RatingMovingAverage& other, DateTime startTime);
	//DateTime getLatestRatingDate(void);
	void setName(Name newName);
	Name getName(void);
	void setOwnerName(Name newName);
	Name getOwnerName(void);
	virtual bool isAParticipationMovingAverage(void);		// for determining if its type is ParticipationMovingAverage or not
	//int getNumRatings(void);
//protected:
	//void assignRating(Rating newRating);
private:
	Name name;
	Name ownerName;
};
#endif