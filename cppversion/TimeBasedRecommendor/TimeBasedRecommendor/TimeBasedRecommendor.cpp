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
	}
}
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
	const Name candidateIndicator = Name("Candidate");
	const Name nameIndicator = Name("Name");
	const Name parentIndicator = Name("Parent");

	const Name ratingIndicator = Name("Rating");
	const Name ratingActivityIndicator = Name("Activity");
	const Name ratingDateIndicator = Name("Date");
	const Name ratingValueIndicator = Name("Score");

	const Name participationIndicator = Name("Participation");
	const Name participationActivityIndicator = Name("Activity");
	const Name participationStartDateIndicator = Name("StartDate");
	const Name participationEndDateIndicator = Name("EndDate");

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
					// Tags associated with candidate activities
					if (endTag == nameIndicator)
						candidate.setName(value);
					if (endTag == parentIndicator)
						candidate.addParent(value);

					// Tags associated with ratings
					if (endTag == ratingActivityIndicator)
						rating.setActivity(value);
					if (endTag == ratingDateIndicator)
						rating.setDate(DateTime(value.getName()));
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

					// tags associated with participations
					if (endTag == participationStartDateIndicator)
						participation.setStartTime(DateTime(value.getName()));
					if (endTag == participationEndDateIndicator)
						participation.setEndTime(DateTime(value.getName()));
					if (endTag == participationActivityIndicator)
						participation.setActivityName(value.getName());
				}
				if (stackCount == 1)
				{
					if (objectName == candidateIndicator)
					{
						// add the candidate to the inheritance hierarchy
						this->addCandidate(candidate);
						candidate = Candidate();
					}
					if (objectName == ratingIndicator)
					{
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
void TimeBasedRecommendor::addCandidate(Candidate candidate)
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
	message("cascading participation ");
	this->printParticipation(&newParticipation);
	message("\r\n");
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
	this->printRating(&newRating);
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
			currentParent = (*parents)[i];
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
	return &(this->candidates[name]);
}

PredictionLink* TimeBasedRecommendor::getLinkFromMovingAverages(MovingAverage* predictor, MovingAverage* predictee)
{
	std::map<MovingAverage*, PredictionLink> links = this->predictionLinks[predictor];
	return &(links[predictee]);
}
Distribution TimeBasedRecommendor::rateCandidateWithName(Name name, DateTime when)
{
	message("rating candidate with name: ");
	message(name.getName());
	message("\r\n");
	Candidate* candidate = this->getCandidateWithName(name);
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
	message(name.getName());
	message("\r\n");
	return currentCandidate->getCurrentRefinedRating();
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
	Distribution guess = this->combineDistributions(guesses);
	candidate->setCurrentRating(guess);
	return guess;
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
		distributions.push_back(currentParent->getCurrentRefinedRating());
	}
	distributions.push_back(currentChildDistribution);
	// Now combine the ratings of each parent with the child's
	Distribution result = this->combineDistributions(distributions);
	candidate->setCurrentRefinedRating(result);
	return result;
}

// compute the distribution that is formed by combining the given distributions
Distribution TimeBasedRecommendor::combineDistributions(std::vector<Distribution>& distributions)
{
	// initialization
	double sumY = 0;
	double sumY2 = 0;
	double sumWeight = 0;	// the sum of the weights that we calculate, which we use to normalize
	bool stdDevIsZero = false;
	double sumVariance = 0;	// variance is another name for standard deviation squared
	double n = 0;			// the sum of the given weights, which we use to assign a weight to our guess
	double weight;
	double y;
	double stdDev;
	message("Combining distributions");
	message("\r\n");
	unsigned int i;
	Distribution* currentDistribution = NULL;
	// iterate over each distribution and weight them according to their given weights and standard deviations
	for (i = 0; i < distributions.size(); i++)
	{
		currentDistribution = &(distributions[i]);
		message("mean = ");
		message(currentDistribution->getMean());
		message(" stdDev = ");
		message(currentDistribution->getStdDev());
		message(" weight = ");
		message(currentDistribution->getWeight());
		message("\r\n");
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
					n = sumWeight = 0;
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
				n += currentDistribution->getWeight();
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
		double average = sumY / sumWeight;
		double variance1 = (sumY2 - sumY * sumY / sumWeight) / sumWeight;
		double variance2 = sumVariance / sumWeight;
		stdDev = sqrt(variance1 + variance2);
		result = Distribution(average, stdDev, n);
	}
	message("resultant distribution = ");
	this->printDistribution(&result);
	message("\r\n");
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
