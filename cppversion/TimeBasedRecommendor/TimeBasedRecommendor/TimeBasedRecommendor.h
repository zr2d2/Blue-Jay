#ifndef _TIME_BASED_RECOMMENDOR_H_
#define _TIME_BASED_RECOMMENDOR_H_

#include <map>
#include <set>
#include <vector>

#include "ArgumentList.h"
#include "Candidate.h"
#include "Name.h"
#include "Rating.h"
#include "PredictionLink.h"

class TimeBasedRecommendor
{
public:
	TimeBasedRecommendor();
	void parseArguments(ArgumentList* arguments);
	void readFile(char* fileName);
private:
	// functions to add data
	void addCandidate(Candidate newCandidate);
	void addRating(Rating newRating);	// adds it to the set of ratings without updating
	void addParticipation(Participation newParticipation);	// adds it to the set of participations without updating
	void addRatingAndCascade(Rating newRating);	// gives the rating to the candidate and all its supercategories
	void addParticipationAndCascade(Participation newParticipation);	// gives the participation to the candidate and all its supercategories
	void linkCandidates(Candidate* candidateOne, Candidate* candidateTwo);
	void linkAverages(MovingAverage* predictor, RatingMovingAverage* predictee);
	void addSomeTestLinks(void);
	void updatePredictions(void);
	// functions to print data
	void message(std::string& text) const;
	void message(char* text) const;
	void message(int text) const;
	void message(char text) const;
	void message(double text) const;
	void printCandidate(Candidate* candidate) const;
	void printRating(Rating* rating) const;
	void printDistribution(Distribution* distribution) const;
	void printParticipation(Participation* participation) const;
	// search functions
	std::vector<Candidate*> findAllSuperCategoriesOf(Candidate* candidate);
	Candidate* getCandidateWithName(Name name);
	PredictionLink* getLinkFromMovingAverages(MovingAverage* predictor, MovingAverage* predictee);
	double rateCandidateWithName(Name name);
	double rateCandidate(Candidate* candidate);
	// member variables
	std::map<Name, std::vector<Name>* > candidatesParents;	// given the name of a candidate, get the names of all its parents
	std::map<Name, Candidate> candidates;					// given the name of the candidate, return the candidate
	std::set<Rating, RatingPrecedes> ratings;				// the set of all ratings, sorted chronologically
	std::set<Participation, ParticipationPrecedes> participations;		// the set of all participations, sorted chronologically
	//std::map<Name, MovingAverage*> movingAverages;		// given a candidate, get the associated moving averages
	// given the MovingAverage to predict and then the MovingAverage to predict from, this gives the appropriate PredictionLink
	std::map<MovingAverage*, std::map<MovingAverage*, PredictionLink> > predictionLinks;
	int numHalfLives;
};

#endif