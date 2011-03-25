#ifndef _CANDIDATE_H_
#define _CANDIDATE_H_

#include <vector>
#include "Name.h"
#include "Rating.h"
#include "RatingMovingAverage.h"
#include "ParticipationMovingAverage.h"
#include "Participation.h"

class Candidate
{
public:
	Candidate(Name title);
	Candidate(void);
	void addParent(Name newName);
	void setName(Name newName);
	Name getName(void);
	std::vector<Name>* getParentNames(void);
	void giveRating(Rating rating);
	void giveParticipation(Participation participation);
	int getNumRatingEstimators(void);
	MovingAverage* getRatingEstimatorAtIndex(int index);
	int getNumFrequencyEstimators(void);
	ParticipationMovingAverage* getFrequencyEstimatorAtIndex(int index);
	RatingMovingAverage* getActualRatingHistory(void);
	Distribution getCurrentRating(void);
	void setCurrentRating(Distribution value);
private:
	void initialize(void);
	Name name;
	std::vector<Name> parentNames;
	std::vector<RatingMovingAverage> ratingEstimators;
	std::vector<ParticipationMovingAverage> frequencyEstimators;
	RatingMovingAverage actualRatingHistory;
	int numRatings;
	DateTime latestRatingTime;
	Distribution currentRating;
};

#endif