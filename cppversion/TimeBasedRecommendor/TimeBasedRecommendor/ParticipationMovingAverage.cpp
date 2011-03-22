#include "stdafx.h"
#include "Math.h"
#include "ParticipationMovingAverage.h"
#include <iostream>

using namespace std;

ParticipationMovingAverage::ParticipationMovingAverage()
{
	//this->halfLife = 1;
}
void ParticipationMovingAverage::addParticipationInterval(Participation interval)
{
	// compute the total of previously observed intensities
	DateTime& startTime = interval.getStartTime();
	DateTime& endTime = interval.getEndTime();
	double preTotalIntensity;
	if (this->totalIntensities.size() > 0)
	{
		preTotalIntensity = this->totalIntensities.back().getIntensity();
	}
	else
	{
		preTotalIntensity = 0;
	}
	// compute the total intensity and add it to the total
	double duration = startTime.timeUntil(endTime);
	double postTotalIntensity = preTotalIntensity + duration * interval.getIntensity();
	// replace the intensity per unit time with a total intensity
	interval.setIntensity(postTotalIntensity);
	// save the interval
	this->totalIntensities.push_back(interval);

/*
	cout << "rating interval with starting date " << interval.getStartTime().stringVersion() << " ending date " << interval.getEndTime().stringVersion() << endl;
	// get interval attributes
	double value = interval.getIntensity();
	DateTime& startTime = interval.getStartTime();
	DateTime& endTime = interval.getEndTime();
	// add the rating for the start of the interval
	double currentScore = this->getValueAt(startTime, false);
	cout << "intensity = " << value << endl;
	cout << "current score = " << currentScore << endl;
	Rating newRating1;
	newRating1.setDate(startTime);
	newRating1.setScore(currentScore);
	this->assignRating(newRating1);
	// compute appropriate exponential average moving towards this value in this interval
	double duration = startTime.timeUntil(endTime);
	double numHalfLives = duration / this->halfLife;
	cout << "num halflives = " << numHalfLives << endl;
	double multiplier = pow(0.5, numHalfLives);
	double currentDifference = currentScore - value;
	double finalDifference = multiplier * currentDifference;
	double newScore = value + finalDifference;
	// Add the rating for the end of the interval
	Rating newRating2 = Rating();
	newRating2.setDate(endTime);
	newRating2.setScore(newScore);
	cout << "rated interval with ending score " << newRating2.getScore() << endl;
	this->assignRating(newRating2);
	*/
}

// find the most recent participation that was started before "when"
int Participation::getIndexForDate(DateTime when, bool strictlyEarlier)
{
	if (this->totalIntensities.size() < 1)
		return -1;
	if (strictlyChronologicallyOrdered(when, this->totalIntensities.front()))
		return -1;
	// If there are participations then we binary search for the most recent one
	int lowerIndex, upperIndex, middleIndex;
	lowerIndex = 0;
	upperIndex = this->ratings.size() - 1;
	if (strictlyEarlier)
	{
		// find the most recent participation that was started strictly before "when"
		while (upperIndex > lowerIndex)
		{
			middleIndex = (lowerIndex + upperIndex) / 2;
			if (strictlyChronologicallyOrdered(when, this->totalIntensities[middleIndex].getStartTime()))
			{
				upperIndex = middleIndex;
			}
			else
			{
				lowerIndex = middleIndex;
			}
		}
	}
	else
	{
		// find the most recent participation that was started at or before "when"
		while (upperIndex > lowerIndex)
		{
			middleIndex = (lowerIndex + upperIndex) / 2;
			if (strictlyChronologicallyOrdered(this->totalIntensities[middleIndex].getStartTime(), when))
			{
				lowerIndex = middleIndex;
			}
			else
			{
				upperIndex = middleIndex;
			}
		}
	}
	return middleIndex;
}
double ParticipationMovingAverage::getTotalIntensityThroughDate(DateTime when)
{
	int index = this->getIndexForDate(when, true);
	if (index < 0)
		return 0;
	Participation mostRecentParticipation = this->totalIntensities[index];
	// if it is after the end of the interval, then the total is still the total at the end of the interval
	if (strictlyChronologicallyOrdered(mostRecentParticipation.getEndTime(), when))
		return mostRecentParticipation.getIntensity();
	// if it's in the middle of the interval, we linearly interpolate
	double previousTotal;
	// compute the previous total
	if (index == 0)
	{
		previousTotal = 0;
	}
	else
	{
		previousTotal = this->totalIntensities[index - 1].getIntensity();
	}
	double currentDuration = mostRecentParticipation.getStartTime().timeUntil(when);
	double totalDuration = mostRecentParticipation.getStartTime().timeUntil(mostRecentParticipation.getEndTime());
	double currentComponent;
	if (totalDuration == 0)
	{
		currentComponent = 0;
	}
	else
	{
		currentComponent = (mostRecentParticipation.getIntensity() - previousTotal) * currentDuration / totalDuration;
	}
	double result = previousTotal + currentComponent;
	return result;
}

Distribution ParticipationMovingAverage::getValueAt(DateTime when, bool strictlyEarlier)
{
	// If there are no ratings then we default to 0
	if (this->getNumRatings() == 0)
		return Distribution(0, 0, 0);
	// If the time is before the first one then we default to 0
	Participation firstParticipation = ratings.front();
	if (!strictlyChronologicallyOrdered(firstRating.getDate(), when))
		return Distribution(0, 0, 0);
	/*// If the time is after the last one, then compute the exponential decay towards zero
	Rating lastRating = ratings.back();
	if (strictlyChronologicallyOrdered(lastRating.getDate(), when))
	{
		double duration = lastRating.getDate().timeUntil(when);
		double numHalfLives = duration / this->halfLife;
		double multiplier = pow(0.5, numHalfLives);
		return lastRating.getScore() * multiplier;
	}*/

	int mostRecentIndex = this->getIndexForDate(when, strictlyEarlier);	
	Participation mostRecentParticipation = totalIntensities[mostRecentIndex];
	DateTime mostRecentDate = mostRecentParticipation.getStartTime();
	double duration = mostRecentDate.timeUntil(when);
	DateTime startDate = mostRecentDate.datePlusDuration(-duration);
	double totalIntensity = this->getTotalIntensityThroughDate(mostRecentDate) - this->getTotalIntensityThroughDate(startDate);
	double totalDuration = mostRecentDate.timeUntil(when);
	double averageIntensity;
	if (totalDuration > 0)
	{
		averageIntensity = totalIntensity / totalDuration;
	}
	else
	{
		averageIntensity = 1;
	}
	Distribution result(averageIntensity, 0, 1);
	//cout << "lowerIndex = " << lowerIndex << endl;
	//cout << "upperIndex = " << upperIndex << endl;
	// Once we get here, we've found the next and previous rating
	/* // Now we'll do an exponential interpolation
	Rating previousRating = ratings[lowerIndex];
	Rating nextRating = ratings[upperIndex];


	// Find the asymptote of the exponentially decaying curve
	double deltaScore = nextRating.getScore() - previousRating.getScore();
	double duration = previousRating.getDate().timeUntil(nextRating.getDate());
	//cout << "duration = " << duration << endl;
	if (duration <= 0)
		return previousRating.getScore();
	double currentHalfLife = this->halfLife;
	if (currentHalfLife <= 0)
		currentHalfLife = duration;
	double fullNumHalfLives = duration / currentHalfLife;
	cout << "num half lives = " << fullNumHalfLives << endl;
	double fullMultiplier = pow(0.5, fullNumHalfLives);
	double maxDeltaScore = deltaScore / (1 - fullMultiplier);
	cout << "max delta score = " << maxDeltaScore << endl;

	double currentDuration = previousRating.getDate().timeUntil(when);
	double currentNumHalfLives = currentDuration / currentHalfLife;
	cout << "current num half lives = " << currentNumHalfLives << endl;
	double currentMultiplier = pow(0.5, currentNumHalfLives);
	double currentDeltaScore = maxDeltaScore * currentMultiplier;
	double score = previousRating.getScore() + maxDeltaScore - currentDeltaScore;
	cout << "score = " << score << endl;
	return score;
	*/
}
/*void ParticipationMovingAverage::setHalfLife(double newHalfLife)
{
	this->halfLife = newHalfLife;
}*/