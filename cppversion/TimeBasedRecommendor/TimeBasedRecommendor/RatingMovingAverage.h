#ifndef RATING_MOVING_AVERAGE_H_
#define RATING_MOVING_AVERAGE_H_

#include "MovingAverage.h"
#include "Distribution.h"

class RatingMovingAverage : public MovingAverage
{
public:
	RatingMovingAverage();
	void addRating(Rating rating);
	//double getLatestValue(void);
	Distribution getValueAt(DateTime when) override;
private:
	int getIndexForDate(DateTime when, bool strictlyEarlier);
	std::vector<Rating> sumRatings;
	std::vector<Rating> sumSquaredRatings;
};

#endif