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
	// constructors
	Candidate(Name title);
	Candidate(void);

	// Name
	void setName(Name newName);
	Name getName(void);

	// adding parent/child links
	void addParent(Name newName);
	void addParent(Candidate* newCandidate);
	void addChild(Candidate* newChild);
	std::vector<Name>* getParentNames(void);
	std::vector<Candidate*>* getParents(void);
	std::vector<Candidate*>* getChildren(void);

	// informing the Candidate when it is rated
	void giveRating(Rating rating);
	// informing the Candidate when it is listened to
	void giveParticipation(Participation participation);

	// how many MovingAverages there are to estimate its rating. Currently it's always 1
	int getNumRatingEstimators(void);
	// get the appropriate MovingAverage
	MovingAverage* getRatingEstimatorAtIndex(int index);
	// how many MovingAverages there are to estimate how often it has been played recently. Currently it's always 1
	int getNumFrequencyEstimators(void);
	// get the appropriate MovingAverage
	ParticipationMovingAverage* getFrequencyEstimatorAtIndex(int index);
	// get the MovingAverage that stores the exact ratings. Currently this is the same as the rating estimator at index 0
	RatingMovingAverage* getActualRatingHistory(void);
	// the current expected rating, based on data from other Candidates
	Distribution getCurrentRating(void);
	void setCurrentRating(Distribution value);
	// the current expected rating, but moved slightly closer to the rating of any parent Candidates
	Distribution getCurrentRefinedRating(void);
	void setCurrentRefinedRating(Distribution value);
	// whether the parent pointers are up to date
	bool needToUpdateParentPointers(void);
	// the date it was added to your library
	void setDiscoveryDate(DateTime when);
	// the duration (in seconds) between the latest listening and the time at 'when'
	double getIdleDuration(DateTime when);
	// the average of all given ratings 
	double getAverageRating(void);
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
	DateTime discoveryDate;
};

#endif