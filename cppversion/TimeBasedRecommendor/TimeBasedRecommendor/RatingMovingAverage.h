#ifndef RATING_MOVING_AVERAGE_H_
#define RATING_MOVING_AVERAGE_H_

#include "MovingAverage.h"
#include "Distribution.h"

// the RatingMovingAverage represents the progression of Ratings for a Candidate over time
class RatingMovingAverage : public MovingAverage
{
public:
	RatingMovingAverage();
	// inform it that the Candidate it cares about was given this Rating
	void addRating(Rating rating);
	//double getLatestValue(void);
	// returns a distribution of the expected values at this time, and an integer identifying how many data points came before it
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