#include "stdafx.h"
#include "Math.h"
#include "RatingMovingAverage.h"
#include <iostream>

using namespace std;

RatingMovingAverage::RatingMovingAverage()
{
	//this->weightOfOldRatings = 0;
}
void RatingMovingAverage::addRating(Rating rating)
{
#if 1
	// get the current running totals
	double totalScore, totalWeight, totalSquaredScore;
	if (this->sumRatings.size() > 0)
	{
		Rating lastRating = this->sumRatings.back();
		totalScore = lastRating.getScore();
		totalWeight = lastRating.getWeight();
		Rating sumSquaredRating = this->sumSquaredRatings.back();
		totalSquaredScore = sumSquaredRating.getScore();
	}
	else
	{
		totalScore = totalWeight = totalSquaredScore = 0;
	}
	// compute new running total
	double newTotalScore = totalScore + rating.getScore() * rating.getWeight();
	double newTotalWeight = totalWeight + rating.getWeight();
	Rating newRating;
	newRating.setScore(newTotalScore);
	newRating.setWeight(newTotalWeight);
	newRating.setDate(rating.getDate());
	// save the new running total
	this->sumRatings.push_back(newRating);

	// compute new running squared total
	double newTotalSquaredScore = totalSquaredScore + rating.getScore() * rating.getScore() * rating.getWeight();
	Rating newSquaredRating;
	newSquaredRating.setScore(newTotalSquaredScore);
	newSquaredRating.setWeight(newTotalWeight);
	newSquaredRating.setDate(rating.getDate());
	this->sumSquaredRatings.push_back(newSquaredRating);
	// also save the rating itself
	this->ratings.push_back(rating);
#else
	// get the current score
	DateTime date = rating.getDate();
	// Move the exponential average towards the new score
	double currentScore = this->getValueAt(date, false);
	double ratingScore = rating.getScore();
	double oldWeight = (double)this->weightOfOldRatings;
	double numRatings = (double)this->getNumRatings();
	if (oldWeight > numRatings)
		oldWeight = numRatings;
	double newScore = (currentScore * oldWeight + ratingScore) / (oldWeight + 1);
	// Add the rating to our vector of ratings
	Rating newAverage;
	newAverage.setDate(rating.getDate());
	newAverage.setScore(newScore);
	newAverage.setWeight(rating.getWeight());
	this->assignRating(newAverage);
#endif
}

Distribution RatingMovingAverage::getValueAt(DateTime when, bool strictlyEarlier)
{
	// If there are no ratings then we default to 0
	if (this->sumRatings.size() == 0)
		return Distribution(0, 0, 0);
	// If the time is before the first one then default to 0
	Rating firstRating = sumRatings.front();
	if (!strictlyChronologicallyOrdered(firstRating.getDate(), when))
		return Distribution(0, 0, 0);
	// find the sum of the ratings up to "when"
	int latestRatingIndex = this->getIndexForDate(when, strictlyEarlier);
	DateTime latestRatingDate = this->sumRatings[latestRatingIndex].getDate();
	// compute the date twice as far in the past as the latest rating date and get its index
	double duration = latestRatingDate.timeUntil(when);
	DateTime oldestRatingDate = latestRatingDate.datePlusDuration(-duration);
	int earliestRatingIndex = this->getIndexForDate(oldestRatingDate, true);
#if 0
	cout << "earliestRatingIndex = " << earliestRatingIndex;
	cout << "actual early rating date = " << this->sumRatings[earliestRatingIndex].getDate().stringVersion() << endl;
	cout << "latestRatingIndex = " << latestRatingIndex;
	cout << "actual late rating date = " << this->sumRatings[latestRatingIndex].getDate().stringVersion() << endl;
#endif
	// compure the distribution of ratings from between the two dates
	Rating latestSumRating = this->sumRatings[latestRatingIndex];
	Rating latestSumSquaredRating = this->sumSquaredRatings[latestRatingIndex];
	Rating earliestSumRating = this->sumRatings[earliestRatingIndex];
	Rating earliestSumSquaredRating = this->sumSquaredRatings[earliestRatingIndex];
	double sumY, sumY2, sumWeight;
	// check whether to include the first point or not
	if (strictlyChronologicallyOrdered(oldestRatingDate, this->sumRatings.front().getDate()))
	{
		//cout << "oldest rating used is before the oldest rating ";
		sumY = latestSumRating.getScore();
		sumY2 = latestSumSquaredRating.getScore();
		sumWeight = latestSumRating.getWeight();
	}
	else
	{
		//cout << "oldest rating used is after the oldest rating ";
		sumY = latestSumRating.getScore() - earliestSumRating.getScore();
		sumY2 = latestSumSquaredRating.getScore() - earliestSumSquaredRating.getScore();
		sumWeight = latestSumSquaredRating.getWeight() - earliestSumSquaredRating.getWeight();
	}
	//cout << "sumWeight = " << sumWeight;
	// compute average, standard deviation, and number of points
	double average = sumY / sumWeight;
	double stdDev = sqrt((sumY2 - sumY * sumY / sumWeight) / sumWeight);
	Distribution result(average, stdDev, sumWeight);
	//cout << endl;
	return result;
}
const std::vector<Rating>& RatingMovingAverage::getRatings(void)
{
	return this->ratings;
}
int RatingMovingAverage::getNumRatings(void)
{
	return (int)this->sumRatings.size();
}
DateTime RatingMovingAverage::getLatestRatingDate(void)
{
	return this->sumRatings.back().getDate();
}

int RatingMovingAverage::getIndexForDate(DateTime when, bool strictlyEarlier)
{
	if (this->sumRatings.size() < 1)
		return -1;
	if (strictlyChronologicallyOrdered(this->sumRatings.back().getDate(), when))
		return this->sumRatings.size() - 1;
	// binary search for the indicated date
	int lowerIndex, upperIndex, middleIndex;
	lowerIndex = 0;
	upperIndex = this->sumRatings.size() - 1;
	while (upperIndex > lowerIndex + 1)
	{
		middleIndex = (lowerIndex + upperIndex) / 2;
		if (strictlyChronologicallyOrdered(this->sumRatings[middleIndex].getDate(), when))
		{
			lowerIndex = middleIndex;
		}
		else
		{
			upperIndex = middleIndex;
		}
	}
	//cout << "lowerIndex = " << lowerIndex << endl;
	//cout << "upperIndex = " << upperIndex << endl;
	// Once we get here, we've found the next and previous rating
	// Now we'll do an exponential interpolation
	Rating previousRating = this->sumRatings[lowerIndex];
	Rating nextRating = this->sumRatings[upperIndex];
	// figure out whether we can use the rating at that time or if we have to use the rating just before it
	if (strictlyEarlier)
	{
		return lowerIndex;
	}
	else
	{
		if (strictlyChronologicallyOrdered(when, nextRating.getDate()))
			return lowerIndex;
		else
			return upperIndex;
	}
}