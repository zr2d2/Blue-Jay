#include "stdafx.h"
#include "Candidate.h"
#include "string.h"
using namespace std;

Candidate::Candidate(Name title)
{
	initialize();
	this->name = title;
}
Candidate::Candidate(void)
{
	//initialize();
}
void Candidate::setName(Name newName)
{
	//printf("setting candidate name %s \r\n", newName.getName().c_str());
	this->name = newName;
	initialize();
}
Name Candidate::getName(void)
{
	return this->name;
}
void Candidate::addParent(Name newName)
{
	//printf("adding parent name %s \r\n", newName.getName().c_str());
	this->parentNames.push_back(newName);
	//this->parentName = newName;
}
std::vector<Name>* Candidate::getParentNames(void)
{
	return &(this->parentNames);
}
void Candidate::giveRating(Rating rating)
{
	unsigned int i;
	// update the moving averages of the ratings
	for (i = 0; i < this->ratingEstimators.size(); i++)
	{
		ratingEstimators[i].addRating(rating);
	}
	this->actualRatingHistory.addRating(rating);
}
void Candidate::giveParticipation(Participation participation)
{
	unsigned int i;
	// update the moving averages of the frequencies
	/*if (numRatings > 0)
	{
		// keep track of the interval of inactivity between the previous and current rating intervals
		Participation idleTime;
		idleTime.setStartTime(latestRatingTime);
		idleTime.setEndTime(participation.getStartTime());
		idleTime.setIntensity(0);
		
		for (i = 0; i < this->frequencyEstimators.size(); i++)
		{
			frequencyEstimators[i].rateInterval(idleTime);
		}
	}
	// keep track of the interval of activity too
	Participation activeTime;
	activeTime.setStartTime(participation.getStartTime());
	activeTime.setEndTime(participation.getEndTime());
	activeTime.setIntensity(1);*/
	for (i = 0; i < this->frequencyEstimators.size(); i++)
	{
		frequencyEstimators[i].addParticipationInterval(participation);
	}
	numRatings++;
	latestRatingTime = participation.getEndTime();
}
int Candidate::getNumRatingEstimators(void)
{
	return this->ratingEstimators.size();
}
MovingAverage* Candidate::getRatingEstimatorAtIndex(int index)
{
	return &(this->ratingEstimators[index]);
}
int Candidate::getNumFrequencyEstimators(void)
{
	return this->frequencyEstimators.size();
}
ParticipationMovingAverage* Candidate::getFrequencyEstimatorAtIndex(int index)
{
	return &(this->frequencyEstimators[index]);
}
RatingMovingAverage* Candidate::getActualRatingHistory(void)
{
	return &(this->actualRatingHistory);
}

void Candidate::initialize(void)
{
	numRatings = 0;
	/*
#ifdef LONG_SCALE
	// Setup a bunch of moving averages with durations from 15 min to about 4 years
	double currentHalfLife = 900;
#else
	// setup a bunch of moving averages with durations from 1 sec to about a day
	double currentHalfLife = 1;
#endif
	double weightForOldRatings = 1;
	*/
	//const int numAverages = 9;
	const int numAverages = 1;
	int i;
	this->ratingEstimators.resize(numAverages);
	this->frequencyEstimators.resize(numAverages);
	for (i = 0; i < numAverages; i++)
	{
		//frequencyEstimators[i].setHalfLife(currentHalfLife);
		frequencyEstimators[i].setName(Name(this->name.getName() + " (halfLives)"));
		//currentHalfLife *= 4;
	}
	for (i = 0; i < numAverages; i++)
	{
		//ratingEstimators[i].setWeightForOldRatings(weightForOldRatings);
		ratingEstimators[i].setName(Name(this->name.getName() + " (ratings)"));
		//weightForOldRatings *= 2;
		//weightForOldRatings *= 4;
	}
	this->actualRatingHistory.setName(Name(this->name.getName() + " actual "));
	//this->actualRatingHistory.setWeightForOldRatings(0);
}