#include "stdafx.h"

#include <fstream>
#include <string.h>
#include "TimeBasedRecommendor.h"
#include "Candidate.h"
#include "Rating.h"
#include "Math.h"

using namespace std;

// constructor
TimeBasedRecommendor::TimeBasedRecommendor()
{
	numHalfLives = 10;
}
// read the given arguments and do what they request
void TimeBasedRecommendor::parseArguments(ArgumentList* arguments)
{
	Rating();
	int i;
	char* argument;
	for (i = 0; i < arguments->getNumArguments(); i++)
	{
		argument = arguments->getArgument(i);
		//message(argument);
		//message("\r\n");
		//message((int)strlen(argument));
		if (strcmp(argument, "open") == 0)
		{
			i++;
			char* fileName = arguments->getArgument(i);
			this->readFile(fileName);
			this->updateChildPointers();
			this->addSomeTestLinks();
			this->updatePredictions();
			continue;
		}
		if (strcmp(argument, "rate") == 0)
		{
			i++;
			char* candidateName = arguments->getArgument(i);
			i++;
			char* dateString = arguments->getArgument(i);
			DateTime when = DateTime(dateString);
			this->rateCandidateWithName(Name(candidateName), when);
			continue;
		}
		if (strcmp(argument, "recommend") == 0)
		{
			i++;
			char* dateString = arguments->getArgument(i);
			DateTime when = DateTime(dateString);
			this->makeRecommendation(when);
		}
	}
}
// read the file and add any data in it
void TimeBasedRecommendor::readFile(char* fileName)
{
	message("opening file ");
	message(fileName);
	message("\r\n");
	ifstream inputStream;
	inputStream.open(fileName);
	char currentChar;
	Name startTag, endTag;
	int stackCount = 0;
	bool readingStartTag = false;
	bool readingValue = false;
	bool readingEndTag = false;
	Candidate candidate;
	Name value;
	Name objectName;
	Rating rating;
	Name activityType;
	Participation participation;
	
	if (!inputStream.is_open())
	{
		message("error opening file");
		return;
	}
	// setup some strings to search for in the file
	const Name candidateIndicator = Name("Candidate");
	const Name nameIndicator = Name("Name");
	const Name parentIndicator = Name("Parent");
	const Name discoveryDateIndicator = Name("DiscoveryDate");

	const Name ratingIndicator = Name("Rating");
	const Name ratingActivityIndicator = Name("Activity");
	const Name ratingDateIndicator = Name("Date");
	const Name ratingValueIndicator = Name("Score");

	const Name participationIndicator = Name("Participation");
	const Name participationActivityIndicator = Name("Activity");
	const Name participationStartDateIndicator = Name("StartDate");
	const Name participationEndDateIndicator = Name("EndDate");

	DateTime currentDate;
	// read until the file is finished
	while (!inputStream.eof())
	{
		// Check if this is a new starttag or endtag
		currentChar = inputStream.get();
		//message(currentChar);
		if (currentChar == '<')
		{
			readingValue = false;
			currentChar = inputStream.get();
			if (currentChar != '/')
			{
				// If we get here, then it's a start tag
				startTag.clear();
				readingStartTag = true;
				stackCount++;
			}
			else
			{
				// If we get here, then it's an end tag
				endTag.clear();
				readingEndTag = true;
				currentChar = inputStream.get();
			}
		}
		// Check if this is the end of a tag
		if (currentChar == '>')
		{
			currentChar = inputStream.get();
			if (readingStartTag)
			{
				if (stackCount == 1)
				{
					// If we get here, then we just read the type of the object that is about to follow
					objectName = startTag;
				}
				//message("start tag = ");
				//message(startTag.getName());
				value.clear();
				readingValue = true;
			}
			if (readingEndTag)
			{
				//message("end tag = ");
				//message(endTag.getName());
				if (stackCount == 2)
				{
					// If we get here, then we just read an attribute of the object

					// If any of these trigger, then we just read an attribute of a candidate (which is a song, artist, genre or whatever)
					if (endTag == nameIndicator)
						candidate.setName(value);
					if (endTag == parentIndicator)
						candidate.addParent(value);
					if (endTag == discoveryDateIndicator)
						candidate.setDiscoveryDate(DateTime(value.getName()));


					// If any of these trigger, then we just read an attribute of a rating
					// Tags associated with ratings
					if (endTag == ratingActivityIndicator)
						rating.setActivity(value);
					if (endTag == ratingDateIndicator)
					{
						// keep track of the latest date ever encountered
						currentDate = DateTime(value.getName());
						if (strictlyChronologicallyOrdered(this->latestDate, currentDate))
							this->latestDate = currentDate;
						rating.setDate(currentDate);
					}
					/*if (endTag == startDateIndicator)
						rating.setStartTime(DateTime(value.getName()));
						*/
					if (endTag == ratingValueIndicator)
					{
						float score;
						sscanf_s(value.getName().c_str(), "%f", &score);
						rating.setScore((double)score);
					}
					/*if (endTag == durationIndicator)
					{
						float duration;
						sscanf_s(value.getName().c_str(), "%f", &duration);
						rating.setDuration((double)duration);
					}*/

					// If any of these trigger, then we just read an attribute of a participation (an instance of listening)
					if (endTag == participationStartDateIndicator)
					{
						// keep track of the latest date ever encountered
						currentDate = DateTime(value.getName());
						if (strictlyChronologicallyOrdered(this->latestDate, currentDate))
							this->latestDate = currentDate;
						participation.setStartTime(currentDate);
					}
					if (endTag == participationEndDateIndicator)
					{
						// keep track of the latest date ever encountered
						currentDate = DateTime(value.getName());
						if (strictlyChronologicallyOrdered(this->latestDate, currentDate))
							this->latestDate = currentDate;
						participation.setEndTime(currentDate);
					}
					if (endTag == participationActivityIndicator)
						participation.setActivityName(value.getName());
				}
				if (stackCount == 1)
				{
					// If we get here then we just finished reading an object
					if (objectName == candidateIndicator)
					{
						// If we get here then we just finished reading a candidate (which is a song, artist, genre or whatever)
						// add the candidate to the inheritance hierarchy
						this->addCandidate(candidate);
						candidate = Candidate();
					}
					if (objectName == ratingIndicator)
					{
						// If we get here then we just finished reading a rating
						// add the rating to the rating set
						this->addRating(rating);
						/*if (rating.getWeight() < -1)
						{
							message("rating weight = ");
							message(rating.getWeight());
							return;
						}*/
						rating = Rating();
					}
					if (objectName == participationIndicator)
					{
						// If we get here then we just finished reading a rating
						this->addParticipation(participation);
						participation = Participation();
					}
				}
				stackCount--;
			}
			readingStartTag = false;
			readingEndTag = false;
		}
		//message("start tag = ");
		//message(startTag.getName());
		// update names accordingly
		if (readingStartTag)
		{
			startTag.appendChar(currentChar);
		}
		if (readingValue)
		{
			value.appendChar(currentChar);
		}
		if (readingEndTag)
		{
			endTag.appendChar(currentChar);
		}
	}
	inputStream.close();
	message("done reading file ");
	message(fileName);
	message("\r\n");
}


// functions to add data
void TimeBasedRecommendor::addCandidate(Candidate& candidate)
{

	//vector<Name>* parentNames = candidate.getParentNames();
	Name childName = candidate.getName();

	message("adding candidate named ");
	this->printCandidate(&candidate);


	// keep track of the candidate
	this->candidates[childName] = candidate;

	// keep track of the candidate's parents
	//this->candidatesParents[childName] = parentNames;

	// keep track of the candidate's moving averages
	//MovingAverage* averages = new MovingAverage[this->numHalfLives];
}
// adds it to the set of ratings without updating
void TimeBasedRecommendor::addRating(Rating newRating)
{
	message("adding rating ");
	this->printRating(&newRating);
	this->ratings.insert(newRating);
	message("\r\n");
}
// adds it to the set of participations without updating
void TimeBasedRecommendor::addParticipation(Participation newParticipation)
{
	message("adding participation ");
	this->printParticipation(&newParticipation);
	this->participations.insert(newParticipation);
	message("\r\n");
}
// gives the participation to the candidate and all its supercategories
void TimeBasedRecommendor::addParticipationAndCascade(Participation newParticipation)
{
	/*
	message("cascading participation ");
	this->printParticipation(&newParticipation);
	message("\r\n");
	*/
	Candidate* candidate = this->getCandidateWithName(newParticipation.getActivityName());
	vector<Candidate*> candidatesToUpdate = this->findAllSuperCategoriesOf(candidate);
	unsigned int i;
	for (i = 0; i < candidatesToUpdate.size(); i++)
	{
		candidatesToUpdate[i]->giveParticipation(newParticipation);
	}
}


// gives the rating to the candidate and all its supercategories
void TimeBasedRecommendor::addRatingAndCascade(Rating newRating)
{
	//message("cascading rating ");
	//this->printRating(&newRating);
	//message("\r\n");
	Candidate* candidate = this->getCandidateWithName(newRating.getActivity());
	vector<Candidate*> candidatesToUpdate = this->findAllSuperCategoriesOf(candidate);
	unsigned int i;
	for (i = 0; i < candidatesToUpdate.size(); i++)
	{
		candidatesToUpdate[i]->giveRating(newRating);
	}
}

void TimeBasedRecommendor::linkCandidates(Candidate* candidateOne, Candidate* candidateTwo)
{
	int frequencyCountA = candidateOne->getNumFrequencyEstimators();
	int ratingCountA = candidateOne->getNumRatingEstimators();
	int frequencyCountB = candidateTwo->getNumFrequencyEstimators();
	int ratingCountB = candidateTwo->getNumRatingEstimators();
	int i, j;
	// using the frequency of A, try to predict the rating for B
	for (i = 0; i < frequencyCountA; i++)
	{
		/*for (j = 0; j < ratingCountB; j++)
		{
			this->linkAverages(candidateOne->getFrequencyEstimatorAtIndex(i), candidateTwo->getRatingEstimatorAtIndex(j));
		}*/
		this->linkAverages(candidateOne->getFrequencyEstimatorAtIndex(i), candidateTwo->getActualRatingHistory());
	}
	// using the frequency of B, try to predict the rating for A
	for (j = 0; j < frequencyCountB; j++)
	{
		/*for (i = 0; i < ratingCountA; i++)
		{
			this->linkAverages(candidateTwo->getFrequencyEstimatorAtIndex(j), candidateOne->getRatingEstimatorAtIndex(i));
		}*/
		this->linkAverages(candidateTwo->getFrequencyEstimatorAtIndex(j), candidateOne->getActualRatingHistory());
	}
	/*for (i = 0; i < ratingCountA; i++)
	{
		for (j = 0; j < ratingCountB; j++)
		{
			// using the rating for A, try to predict the rating for B
			this->linkAverages(candidateOne->getRatingEstimatorAtIndex(i), candidateTwo->getRatingEstimatorAtIndex(j));
			// using the rating for B, try to predict the rating for A
			this->linkAverages(candidateTwo->getRatingEstimatorAtIndex(j), candidateOne->getRatingEstimatorAtIndex(i));
		}
	}*/
	// using the rating for A, try to predict the rating for B
	for (i = 0; i < ratingCountA; i++)
	{
		this->linkAverages(candidateOne->getRatingEstimatorAtIndex(i), candidateTwo->getActualRatingHistory());
	}
	// using the rating for B, try to predict the rating for A
	for (j = 0; j < ratingCountB; j++)
	{
		this->linkAverages(candidateTwo->getRatingEstimatorAtIndex(j), candidateOne->getActualRatingHistory());
	}
}
void TimeBasedRecommendor::linkAverages(MovingAverage* predictor, RatingMovingAverage* predictee)
{
	map<MovingAverage*, PredictionLink>& links = predictionLinks[predictee];
	PredictionLink link = PredictionLink(predictor, predictee);
	links[predictor] = link;
}
void TimeBasedRecommendor::updateChildPointers(void)
{
	// iterate over each candidate
	std::map<Name, Candidate>::iterator candidateIterator;
	Candidate* currentCandidate;
	Candidate* parent;
	unsigned int i;
	for (candidateIterator = this->candidates.begin(); candidateIterator != this->candidates.end(); candidateIterator++)
	{
		currentCandidate = &((*candidateIterator).second);
		if (currentCandidate->needToUpdateParentPointers())
		{
			// if we get here then this candidate was added recently and its parents need their child pointers updated
			vector<Name>* parentNames = currentCandidate->getParentNames();
			for (i = 0; i < parentNames->size(); i++)
			{
				parent = this->getCandidateWithName((*parentNames)[i]);
				currentCandidate->addParent(parent);
				parent->addChild(currentCandidate);
			}
		}
	}

}

void TimeBasedRecommendor::addSomeTestLinks(void)
{
	message("adding some test links\r\n");
	std::map<Name, Candidate>::iterator iterator1;
	std::map<Name, Candidate>::iterator iterator2;
	Candidate* candidate1;
	Candidate* candidate2;
	// currently we add all combinations of links
	for (iterator1 = this->candidates.begin(); iterator1 != this->candidates.end(); iterator1++)
	{
		candidate1 = &((*iterator1).second);
		for (iterator2 = iterator1; iterator2 != this->candidates.end(); iterator2++)
		{
			candidate2 = &((*iterator2).second);
			this->linkCandidates(candidate1, candidate2);
		}
	}
}

void TimeBasedRecommendor::updatePredictions(void)
{
	message("updating predictions\r\n");
	message("giving ratings to activities\r\n");
	// inform each Candidate of the ratings given to it
	std::set<Rating, RatingPrecedes>::iterator ratingIterator;
	Rating rating;
	Name activityName;
	//Candidate* candidate;
	int numRatings = 0;
	//vector<Name>* parentNames;
	for (ratingIterator = ratings.begin(); ratingIterator != ratings.end(); ratingIterator++)
	{
		numRatings++;
		rating = *ratingIterator;
		this->addRatingAndCascade(rating);
		//activityName = rating.getActivity();
		//message("activity name = ");
		//message(activityName.getName());
		//message("\r\n");
		//candidate = this->getCandidateWithName(activityName);
		//candidate->giveRating(rating);
	}
	message("num ratings given = ");
	message(numRatings);
	message("\r\n");

	message("giving participations to activities");
	set<Participation, ParticipationPrecedes>::iterator participationIterator;
	for (participationIterator = this->participations.begin(); participationIterator != participations.end(); participationIterator++)
	{
		this->addParticipationAndCascade(*participationIterator);
	}
	message("\r\n");


	message("creating PredictionLinks");
	// have each PredictionLink update itself with the changes to the appropriate MovingAverage
	map<MovingAverage*, std::map<MovingAverage*, PredictionLink> >::iterator mapIterator;
	map<MovingAverage*, PredictionLink>* currentMap;
	//pair<MovingAverage* const, std::map<MovingAverage*, PredictionLink> > currentPair;
	map<MovingAverage*, PredictionLink>::iterator predictionIterator;
	PredictionLink* currentLink;
	int numUpdates = 0;
	for (mapIterator = this->predictionLinks.begin(); mapIterator != this->predictionLinks.end(); mapIterator++)
	{
		currentMap = &((*mapIterator).second);	// get the map within the map
		for (predictionIterator = currentMap->begin(); predictionIterator != currentMap->end(); predictionIterator++)
		{
			numUpdates++;
			//message("updating a PredictionLink");
			currentLink = &((*predictionIterator).second);	// get the prediction link from within the map
			currentLink->update();
		}
	}
	message("num PredictionLinks updated = ");
	message(numUpdates);
	message("\r\n");
}




// search functions
vector<Candidate*> TimeBasedRecommendor::findAllSuperCategoriesOf(Candidate* candidate)
{
	// setup a set to check for duplicates and a vector for sequential access
	set<Candidate*> setToUpdate;
	vector<Candidate*> vectorToUpdate;
	// initialize with the one leaf node
	Candidate* currentCandidate = candidate;
	setToUpdate.insert(currentCandidate);
	vectorToUpdate.push_back(currentCandidate);
	// compute the set of all supercategories of this activity
	bool busy = true;
	Candidate* currentParent = NULL;
	set<Name>::iterator setIterator;
	//vector<Name>* currentParentNames;
	vector<Candidate*>* parents = NULL;
	unsigned int i;
	unsigned int j;
	// iterate over each newly found candidate
	for (i = 0; i < vectorToUpdate.size(); i++)
	{
		currentCandidate = vectorToUpdate[i];
		//currentParentNames = currentCandidate->getParentNames();
		parents = currentCandidate->getParents();
		// add all parents of the newly found candidate
		for (j = 0; j < parents->size(); j++)
		{
			//currentParent = this->getCandidateWithName((*currentParentNames)[j]);
			currentParent = (*parents)[j];
			if (setToUpdate.find(currentParent) == setToUpdate.end())
			{
				//message("cascading to a parent\r\n");
				setToUpdate.insert(currentParent);
				vectorToUpdate.push_back(currentParent);
			}
		}
	}
	return vectorToUpdate;
}

Candidate* TimeBasedRecommendor::getCandidateWithName(Name name)
{
	Candidate* candidate = &(this->candidates[name]);
	if (candidate->getName() == Name(""))
	{
		message("error finding candidate named");
		message(name.getName());
	}
	return candidate;
}

PredictionLink* TimeBasedRecommendor::getLinkFromMovingAverages(MovingAverage* predictor, MovingAverage* predictee)
{
	std::map<MovingAverage*, PredictionLink> links = this->predictionLinks[predictor];
	return &(links[predictee]);
}
Distribution TimeBasedRecommendor::rateCandidate(Candidate* candidate, DateTime when)
{
	message("rating candidate with name: ");
	message(candidate->getName().getName());
	message("\r\n");
	vector<Candidate*> parents = this->findAllSuperCategoriesOf(candidate);
	int i;
	Candidate* currentCandidate = NULL;
	for (i = parents.size() - 1; i >= 0; i--)
	{
		currentCandidate = parents[i];
		message("rating candidate ");
		message(currentCandidate->getName().getName());
		// Calculate a rating based on PredictionLinks. If there isn't much data it won't be very good
		currentCandidate->setCurrentRating(this->rateCandidateByCorrelation(currentCandidate, when));
		message("rating = ");
		this->printDistribution(&(currentCandidate->getCurrentRating()));
		// Update the rating using parental information. This is to improve guesses for items that have little data but whose parents have data
		this->updateCandidateRatingFromParents(currentCandidate);
	}
	//Distribution rating = this->rateCandidateByCorrelation(candidate, when);
	message("done rating candidate with name ");
	message(candidate->getName().getName());
	message("\r\n");
	message("rating = ");
	this->printDistribution(&(candidate->getCurrentRefinedRating()));
	for (i = 0; i < (int)parents.size(); i++)
	{
		currentCandidate = parents[i];
		message("name = ");
		message(currentCandidate->getName().getName());
		message(" rating = ");
		message(currentCandidate->getCurrentRefinedRating().getMean());
		message("\r\n");
	}
	//Distribution expectedRating = candidate->getCurrentRefinedRating();
	//double duration = candidate
	return candidate->getCurrentRefinedRating();
}
Distribution TimeBasedRecommendor::rateCandidateWithName(Name name, DateTime when)
{
	return this->rateCandidate(this->getCandidateWithName(name), when);
}
// compute the rating for the candidate using all of the relevant prediction links (predicting based on other moving averages)
Distribution TimeBasedRecommendor::rateCandidateByCorrelation(Candidate* candidate, DateTime when)
{
	// get some pointers to the relevant data and initialize
	MovingAverage* shortTermAverage = candidate->getActualRatingHistory();
	map<MovingAverage*, PredictionLink>& links = predictionLinks[shortTermAverage];
	map<MovingAverage*, PredictionLink>::iterator mapIterator;
	PredictionLink* currentLink;
	Name predictorName, predicteeName;
	predicteeName = candidate->getName();
	vector<Distribution> guesses;
	Distribution* currentGuess = NULL;
	// iterate over all relevant prediction links
	for (mapIterator = links.begin(); mapIterator != links.end(); mapIterator++)
	{
		currentLink = &((*mapIterator).second);
		predictorName = (*mapIterator).first->getName();
		message("Predicting ");
		message(predicteeName.getName());
		message(" from ");
		message(predictorName.getName());
		message("\r\n");
		currentGuess = &(currentLink->guess(when));
		this->printDistribution(currentGuess);
		message("\r\n");
		guesses.push_back(*currentGuess);
	}
	//double average = candidate->getAverageRating();
	// We don't want to ever completely forget about a song. So, move it logarithmically closer to perfection
	//Distribution rememberer = Distribution(1, 1, log(candidate->getIdleDuration(when) + 1));
	//Distribution rememberer = Distribution(1, 1.0/3.0, sqrt(candidate->getIdleDuration(when)));
	double remembererDuration = candidate->getIdleDuration(when);
	if (remembererDuration < 1)
		remembererDuration = 1;
	// The goal is to make d = sqrt(t) where d is the duration between listenings and t = num seconds
	// Then n = sqrt(t) where n is the number of ratings
	// If the user reliably rates a song down, then for calculated distributions, stddev = 1 / n = 1 / sqrt(t) and weight = n = sqrt(t)
	// Then it is about ideal for the rememberer to have stddev = 1 / n and weight = d
	// If the user only usually rates a song down, then for calculated distributions, stddev = k and weight = n
	// Then it is about ideal for the rememberer to have stddev = k and weight = d
	// This is mostly equivalent to stddev = d^(-1/3), weight = d^(2/3)
	// So we could even make the rememberer stronger than the current stddev = d^(-1/3), weight = d^(1/3)
	//double squareRoot = sqrt(remembererDuration);
	double cubeRoot = pow(remembererDuration, 1.0/3.0);
	Distribution rememberer = Distribution(1, 1 / cubeRoot, cubeRoot);
	guesses.push_back(rememberer);
	Distribution guess = this->averageDistributions(guesses);
#if 0
	// remove the rememberer from the total weight though because it doesn't increase our certainty
	double weight = guess.getWeight() - rememberer.getWeight();
	Distribution result = Distribution(guess.getMean(), guess.getStdDev(), guess.getWeight() - rememberer.getWeight());
	candidate->setCurrentRating(result);
	return result;
#else
	candidate->setCurrentRating(guess);
	return guess;
#endif
}
// Using the current estimated rating for the candidate and the estimates for parents, compute an updated rating for the candidate
// It assumes that all parents are already correct
Distribution TimeBasedRecommendor::updateCandidateRatingFromParents(Candidate* candidate)
{
	// get the candidate's rating without parental information
	Distribution currentChildDistribution = candidate->getCurrentRating();
	// now get the ratings for each parent
	vector<Candidate*>* parents = candidate->getParents();
	unsigned int i;
	Candidate* currentParent = NULL;
	vector<Distribution> distributions;
	Distribution parentDistribution;
	Distribution currentDistribution;
	double scale;
	// figure out by what factor to decrease the importance of the parent distributions
	// The child distribution is a better predictor than the parent distribution, so weight the child distribution by another factor of sqrt(n)
	// THIS ISN'T THE BEST APPROXIMATION BUT IT WILL DO FOR NOW. IT WOULD BE PREFERABLE TO COMPUTE THE STDDEV BETWEEN CHILDREN AND WITHIN CHILDREN AND WEIGHT ACCORDINGLY
	if (currentChildDistribution.getWeight() == 0)
		scale = 1;
	else
		scale = 1 / sqrt(currentChildDistribution.getWeight());
	for (i = 0; i < parents->size(); i++)
	{
		currentParent = (*parents)[i];
		parentDistribution = currentParent->getCurrentRefinedRating();
		currentDistribution = Distribution(parentDistribution.getMean(), parentDistribution.getStdDev(), parentDistribution.getWeight() * scale);
		distributions.push_back(currentDistribution);
	}
	distributions.push_back(currentChildDistribution);
	double average = candidate->getAverageRating();
	// Now combine the ratings of each parent with the child's
	Distribution result = this->averageDistributions(distributions);
	candidate->setCurrentRefinedRating(result);
	return result;
}

// determines which candidate has the best expected score and returns its name
Name TimeBasedRecommendor::makeRecommendation(void)
{
	DateTime when = this->latestDate;
	return this->makeRecommendation(when);
}
// determines which candidate has the best expected score at the given time
Name TimeBasedRecommendor::makeRecommendation(DateTime when)
{
	message("making recommendation for date:");
	message(when.stringVersion());
	message("\r\n");
	std::map<Name, Candidate>::iterator candidateIterator;
	// make sure that there is at least one candidate to choose from
	if (this->candidates.size() < 1)
	{
		return Name("[no data]");
	}
	map<double, Name> guesses;
	bool scoreValid = false;
	Candidate* currentCandidate = NULL;
	double bestScore = -1;
	double currentScore = -1;
	Name bestName;
	for (candidateIterator = this->candidates.begin(); candidateIterator != this->candidates.end(); candidateIterator++)
	{
		currentCandidate = &((*candidateIterator).second);
		if (currentCandidate->getChildren()->size() == 0)
		{
			this->rateCandidate(currentCandidate, when);
			currentScore = currentCandidate->getCurrentRefinedRating().getMean();
			message("candidate name = ");
			message(currentCandidate->getName().getName());
			message(" expected rating = ");
			message(currentScore);
			message("\r\n");
			guesses[currentScore] = currentCandidate->getName();
			if ((currentScore > bestScore) || !scoreValid)
			{
				bestScore = currentScore;
				bestName = currentCandidate->getName();
				scoreValid = true;
			}
		}
	}
	map<double, Name>::iterator distributionIterator;
	for (distributionIterator = guesses.begin(); distributionIterator != guesses.end(); distributionIterator++)
	{
		message("candidate name = ");
		message((*distributionIterator).second.getName());
		message(" expected rating = ");
		message((*distributionIterator).first);
		message("\r\n");
	}
	message("best candidate name = ");
	message(bestName.getName());
	message(" expected rating = ");
	message(bestScore);
	message("\r\n");
	return bestName;
}

// compute the distribution that is formed by combining the given distributions
// Each distribution is the offset from zero and the result is the expected total offset from zero
Distribution TimeBasedRecommendor::addDistributions(std::vector<Distribution>& distributions, double average)
{
	return this->averageDistributions(distributions);
}

// compute the distribution that is formed by combining the given distributions
// Each distribution is the offset from zero and the result is the expected total offset from zero
Distribution TimeBasedRecommendor::averageDistributions(std::vector<Distribution>& distributions)
{
	// initialization
	double sumY = 0;
	double sumY2 = 0;
	double sumWeight = 0;	// the sum of the weights that we calculate, which we use to normalize
	bool stdDevIsZero = false;
	double sumVariance = 0;	// variance is another name for standard deviation squared
	double outputWeight = 0;// the sum of the given weights, which we use to assign a weight to our guess
	double count = 0;	// the number of distributions being used
	double weight;
	double y;
	double stdDev;
#define DEBUG
#ifdef DEBUG
	message("averaging distributions");
	message("\r\n");
#endif
	unsigned int i;
	Distribution* currentDistribution = NULL;
	// iterate over each distribution and weight them according to their given weights and standard deviations
	for (i = 0; i < distributions.size(); i++)
	{
		currentDistribution = &(distributions[i]);
#ifdef DEBUG
		message("mean = ");
		message(currentDistribution->getMean());
		message(" stdDev = ");
		message(currentDistribution->getStdDev());
		message(" weight = ");
		message(currentDistribution->getWeight());
		message("\r\n");
#endif
		//this->printDistribution(currentDistribution);
		stdDev = currentDistribution->getStdDev();
		// only consider nonempty distributions
		if (currentDistribution->getWeight() > 0)
		{
			// If the standard deviation of any distribution is zero, then compute the average of only distributions with zero standard deviation
			if (stdDev == 0)
			{
				if (!stdDevIsZero)
				{
					stdDevIsZero = true;
					sumVariance = 0;
					sumY = sumY2 = 0;
					outputWeight = count = sumWeight = 0;
				}
			}
			// Figure out whether we care about this distribution or not
			if ((stdDev == 0) || (!stdDevIsZero))
			{
				// get the values from the distribution
				y = currentDistribution->getMean();
				if (stdDev == 0)
				{
					// If stddev is zero, then just use the given weight
					weight = currentDistribution->getWeight();
				}
				else
				{
					// If stddev is nonzero then weight based on both the stddev and the given weight
					weight = currentDistribution->getWeight() / stdDev;
				}
				// add to the running totals
				sumY += y * weight;
				sumY2 += y * y * weight;
				sumWeight += weight;
				sumVariance += stdDev * stdDev * weight;
				outputWeight += currentDistribution->getWeight();
				count += 1;
			}
		}
	}
	Distribution result;
	if (sumWeight == 0)
	{
		// If we have no data then just make something up and report that we don't know
		result = Distribution(0, 0, 0);
	}
	else
	{
		// If we did have a distribution to predict from then we can calculate the average and standard deviations
		double newAverage = sumY / sumWeight;
		double variance1 = (sumY2 - sumY * sumY / sumWeight) / sumWeight;
		message("variance1 = ");
		message(variance1);
		message("\r\n");
		double variance2 = sumVariance / sumWeight;
		message("variance2 = ");
		message(variance2);
		message("\r\n");
		stdDev = sqrt(variance1 + variance2);
		result = Distribution(newAverage, stdDev, outputWeight);
	}
#ifdef DEBUG
	message("resultant distribution = ");
	this->printDistribution(&result);
	message("\r\n");
	message("average of all distributions");
	message(sumY / sumWeight);
	message("\r\n");
#endif
	return result;
}


// print functions
void TimeBasedRecommendor::message(string& text) const
{
	printf(text.c_str());
	//printf("%s", text);
}
void TimeBasedRecommendor::message(char* text) const
{
	printf(text);
}
void TimeBasedRecommendor::message(int text) const
{
	printf("%d", text);
}
void TimeBasedRecommendor::message(char text) const
{
	printf("%c", text);
}
void TimeBasedRecommendor::message(double text) const
{
	printf("%f", (float)text);
}
void TimeBasedRecommendor::printCandidate(Candidate* candidate) const
{
	vector<Name>* parentNames = candidate->getParentNames();
	message(candidate->getName().getName());
	message("\r\nparent names:\r\n");
	unsigned int i;
	for (i = 0; i < parentNames->size(); i++)
	{
		message((*parentNames)[i].getName());
		message("\r\n");
	}
	message("\r\n");
}
void TimeBasedRecommendor::printRating(Rating* rating) const
{
	message("activity name:");
	message(rating->getActivity().getName());
	message("\r\n");

	message("date:");
	string dateString = rating->getDate().stringVersion();
	message(dateString);
	//free(endTimeString);
	message("\r\n");

	message("score:");
	message(rating->getScore());
	message("\r\n");

	/*message("duration:");
	message(rating.getDuration());
	message("\r\n");
	*/
}
void TimeBasedRecommendor::printDistribution(Distribution* distribution) const
{
	message("mean:");
	message(distribution->getMean());
	//message("\r\n");
	
	message(" stdDev:");
	message(distribution->getStdDev());
	//message("\r\n");

	message(" weight:");
	message(distribution->getWeight());
	message("\r\n");
}

void TimeBasedRecommendor::printParticipation(Participation* participation) const
{
	message("start time = ");
	message(participation->getStartTime().stringVersion());
	message("end time = ");
	message(participation->getEndTime().stringVersion());
	message("activity = ");
	message(participation->getIntensity());
	message("\r\n");
}
