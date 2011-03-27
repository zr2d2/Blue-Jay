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
// currently the copy constructor does not copy ratings because a candidate with ratings should never be copied
/*Candidate::Candidate(const Candidate& original)
{
	this->name = original.name;
	initialize();
}*/
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
void Candidate::addParent(Candidate* newCandidate)
{
	//printf("adding parent name %s \r\n", newName.getName().c_str());
	this->parents.push_back(newCandidate);
	//this->parentName = newName;
}
void Candidate::addChild(Candidate* newChild)
{
	this->children.push_back(newChild);
}

std::vector<Name>* Candidate::getParentNames(void)
{
	return &(this->parentNames);
}
std::vector<Candidate*>* Candidate::getParents(void)
{
	return &(this->parents);
}

std::vector<Candidate*>* Candidate::getChildren(void)
{
	return &(this->children);
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
// inform the Candidate that it was listened to during a certain interval
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
// returns the number of MovingAverages that try to estimate the current rating
int Candidate::getNumRatingEstimators(void)
{
	return this->ratingEstimators.size();
}
// returns a particular rating estimator
MovingAverage* Candidate::getRatingEstimatorAtIndex(int index)
{
	return &(this->ratingEstimators[index]);
}
// returns the number of MovingAverages that try to estimate how often this song has been listened to recently
int Candidate::getNumFrequencyEstimators(void)
{
	return this->frequencyEstimators.size();
}
// returns a particular frequency estimator
ParticipationMovingAverage* Candidate::getFrequencyEstimatorAtIndex(int index)
{
	return &(this->frequencyEstimators[index]);
}
// returns the moving average that records the exact ratings
RatingMovingAverage* Candidate::getActualRatingHistory(void)
{
	return &(this->actualRatingHistory);
}
Distribution Candidate::getCurrentRating(void)
{
	return this->currentRating;
}
void Candidate::setCurrentRating(Distribution value)
{
	this->currentRating = value;
}
Distribution Candidate::getCurrentRefinedRating(void)
{
	return this->currentRefinedRating;
}
void Candidate::setCurrentRefinedRating(Distribution value)
{
	this->currentRefinedRating = value;
}
bool Candidate::needToUpdateParentPointers(void)
{
	if (this->parentLinksNeeedUpdating)
	{
		parentLinksNeeedUpdating = false;
		return true;
	}
	return false;
}


void Candidate::setDiscoveryDate(DateTime when)
{
	this->discoveryDate = when;
}
// Tells how long it has been since the song was heard. If it's never been heard then it tells how longs it's been since the song was discovered
double Candidate::getIdleDuration(DateTime when)
{
	DateTime latestDate;
	//latestDate = this->actualRatingHistory.getLatestRatingDate();
	ParticipationMovingAverage* frequencies = this->getFrequencyEstimatorAtIndex(0);
	if (frequencies->getNumParticipations() > 0)
		latestDate = frequencies->getLatestDate();
	else
		latestDate = this->discoveryDate;
	return latestDate.timeUntil(when);
}
double Candidate::getAverageRating(void)
{
	return this->actualRatingHistory.getAverageValue();
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
		frequencyEstimators[i].setName(Name(this->name.getName() + " (participations)"));
		frequencyEstimators[i].setOwnerName(this->name);
		//frequencyEstimators[i].setOwner(this);
		//currentHalfLife *= 4;
	}
	for (i = 0; i < numAverages; i++)
	{
		//ratingEstimators[i].setWeightForOldRatings(weightForOldRatings);
		ratingEstimators[i].setName(Name(this->name.getName() + " (ratings)"));
		ratingEstimators[i].setOwnerName(this->name);
		//ratingEstimators[i].setOwner(this);
		//weightForOldRatings *= 2;
		//weightForOldRatings *= 4;
	}
	this->actualRatingHistory.setName(Name(this->name.getName() + " actual "));
	this->actualRatingHistory.setOwnerName(this->name);
	//this->actualRatingHistory.setOwner(this);
	//this->actualRatingHistory.setWeightForOldRatings(0);
}