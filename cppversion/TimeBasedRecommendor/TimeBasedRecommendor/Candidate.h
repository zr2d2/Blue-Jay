#ifndef _CANDIDATE_H_
#define _CANDIDATE_H_

#include <vector>
#include "Name.h"
#include "Rating.h"
#include "RatingMovingAverage.h"
#include "ParticipationMovingAverage.h"
#include "Participation.h"

// the Candidate class represents an item like that can have a rating, such as a song, artist, genre, or playlist
class Candidate
{
public:
	Candidate(Name title);
	Candidate(void);
	void addParent(Name newName);
	void addParent(Candidate* newCandidate);
	void addChild(Candidate* newChild);
	void setName(Name newName);
	Name getName(void);
	std::vector<Name>* getParentNames(void);
	std::vector<Candidate*>* getParents(void);
	void giveRating(Rating rating);
	void giveParticipation(Participation participation);
	int getNumRatingEstimators(void);
	MovingAverage* getRatingEstimatorAtIndex(int index);
	int getNumFrequencyEstimators(void);
	ParticipationMovingAverage* getFrequencyEstimatorAtIndex(int index);
	RatingMovingAverage* getActualRatingHistory(void);
	Distribution getCurrentRating(void);
	void setCurrentRating(Distribution value);
	Distribution getCurrentRefinedRating(void);
	void setCurrentRefinedRating(Distribution value);
	bool needToUpdateParentPointers(void);
private:
	void initialize(void);
	Name name;
	std::vector<Name> parentNames;	// parentNames is only used at the beginning for storing names before the parents exist
	std::vector<Candidate*> parents;	// 'parents' is faster to use than parentNames but holds the same information
	std::vector<Candidate*> children;
	std::vector<RatingMovingAverage> ratingEstimators;
	std::vector<ParticipationMovingAverage> frequencyEstimators;
	RatingMovingAverage actualRatingHistory;
	int numRatings;
	DateTime latestRatingTime;
	Distribution currentRating;			// the rating based on PredictionLinks before incorporating information about the parents
	Distribution currentRefinedRating;	// the rating after moving slightly closer to the parent rating
	bool parentLinksNeeedUpdating;
};

#endif