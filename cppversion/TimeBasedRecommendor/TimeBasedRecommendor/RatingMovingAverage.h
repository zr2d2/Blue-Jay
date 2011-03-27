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
	std::pair<Distribution, int> getValueAt(DateTime when, bool strictlyEarlier);
	const std::vector<Rating>& getRatings(void);
	int getNumRatings(void);
	//DateTime getLatestRatingDate(void);
	double getAverageValue(void);
	DateTime getLatestDate(void) override;
private:
	int getIndexForDate(DateTime when, bool strictlyEarlier);
	std::vector<Rating> ratings;
	std::vector<Rating> sumRatings;
	std::vector<Rating> sumSquaredRatings;
};

#endif