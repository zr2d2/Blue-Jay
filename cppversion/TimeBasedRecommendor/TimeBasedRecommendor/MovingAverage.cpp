#include "stdafx.h"
#include "MovingAverage.h"
#include "RatingMovingAverage.h"
#include "Math.h"
#include <iostream>

using namespace std;

MovingAverage::MovingAverage(void)
{
}
/*void MovingAverage::rateInterval(Participation interval)
//void MovingAverage::rateInterval(double value, DateTime startTime, DateTime endTime)
{
	// get interval attributes
	double value = interval.getIntensity();
	DateTime& startTime = interval.getStartTime();
	DateTime& endTime = interval.getEndTime();
	// add the rating for the start of the interval
	double currentScore = this->getValueAt(startTime);
	Rating newRating1;
	newRating1.setDate(startTime);
	//newRating1.setEndTime(startTime);
	newRating1.setScore(currentScore);
	this->ratings.push_back(newRating1);
	// compute appropriate exponential average moving towards this value in this interval
	double duration = startTime.timeUntil(endTime);
	double numHalfLives = duration / this->halfLife;
	double multiplier = pow(0.5, numHalfLives);
	double currentDifference = value - currentScore;
	double finalDifference = multiplier * currentDifference;
	double newScore = currentScore + finalDifference;
	// Add the rating for the end of the interval
	Rating newRating2 = Rating();
	newRating2.setDate(endTime);
	//newRating2.setEndTime(endTime);
	newRating2.setScore(newScore);
	this->ratings.push_back(newRating2);
}*/
/*void MovingAverage::addRating(Rating rating)
{
	// get the current score
	DateTime date = rating.getDate();
	// Move the exponential average towards the new score
	double currentScore = this->getValueAt(date);
	double ratingScore = rating.getScore();
	double oldWeight = (double)this->weightOfOldRatings;
	if (oldWeight > (double)ratings.size())
		oldWeight = (double)ratings.size();
	double newScore = (currentScore * oldWeight + ratingScore) / (oldWeight + 1);
	// Add the rating to our vector of ratings
	Rating newAverage;
	newAverage.setDate(rating.getDate());
	newAverage.setScore(newScore);
	newAverage.setWeight(rating.getWeight());
	this->ratings.push_back(newAverage);
}*/
Distribution MovingAverage::getValueAt(DateTime when, bool strictlyEarlier)
{
	Distribution result(0, 0, 0);
	return result;
}
/*double MovingAverage::getLatestValue(void)
{
	if (this->ratings.size() > 0)
		return this->ratings.back().getScore();
	else
		return 0;
}*/
/*void MovingAverage::setHalfLife(double newHalfLife)
{
	this->halfLife = newHalfLife;
}*/
/*void MovingAverage::setWeightForOldRatings(double weightForOldRatings)
{
	this->weightOfOldRatings = weightForOldRatings;
}*/
vector<Datapoint> MovingAverage::getCorrelationsFor(RatingMovingAverage& other, DateTime startTime)
{
	//cout << "getting correlations" << endl;
	int i;
	std::vector<Rating> otherRatings = other.getRatings();
	// first find the starting index
	for (i = otherRatings.size() - 1; i >= 0; i--)
	{
		//cout << "i = " << i << endl;
		if (strictlyChronologicallyOrdered(otherRatings[i].getDate(), startTime))
			break;
		//cout << "test= " << other.ratings[i].getDate().stringVersion() << " start= " << startTime.stringVersion() << endl;
	}
	int startingIndex = i + 1;
	vector<Datapoint> results;
	double x, y, weight;
	weight = 1;
	//if (other.ratings.size() > 0)
	//	cout << "other.ratings.size() = " << other.ratings.size() << endl;
	/*cout << "raw input data : " << endl;
	for (i = 0; i < (int)ratings.size(); i++)
	{
		cout << ratings[i].getScore() << ", ";
	}

	cout << "interpolations = " << endl;
	*/
	// This should be improved eventually.
	// We should give the deviation of each point to the scatterplot in some meaningful way
	for (i = startingIndex; i < (int)otherRatings.size(); i++)
	{
		Distribution distribution = this->getValueAt(otherRatings[i].getDate(), true);
		x = distribution.getMean();
		y = otherRatings[i].getScore();
		weight = otherRatings[i].getWeight();
		//if (weight != 1)
#if 0
		cout << "i = " << i << endl;
		cout << "(x = " << x;
		cout << ", y = " << y << "), ";
		cout << "weight = " << weight << endl;
#endif
		results.push_back(Datapoint(x, y, weight));
	}
	//cout << endl;
	//cout << "done getting correlations" << endl;
	return results;
}

/*DateTime MovingAverage::getLatestRatingDate(void)
{
	return this->ratings.back().getDate();
}*/
void MovingAverage::setName(Name newName)
{
	name = newName;
}
Name MovingAverage::getName(void)
{
	return name;
	/*if (this->ratings.size() > 0)
		return this->ratings[0].getActivity();
	else
		return Name("Unknown name - no ratings yet");
	*/
}
/*int MovingAverage::getNumRatings(void)
{
	return ratings.size();
}*/
/*void MovingAverage::assignRating(Rating newRating)
{
	this->ratings.push_back(newRating);
}
*/