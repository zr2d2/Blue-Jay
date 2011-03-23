#include "stdafx.h"

#include <fstream>
#include <string.h>
#include "TimeBasedRecommendor.h"
#include "Candidate.h"
#include "Rating.h"

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
			this->addSomeTestLinks();
			this->updatePredictions();
			continue;
		}
		if (strcmp(argument, "rate") == 0)
		{
			i++;
			char* candidateName = arguments->getArgument(i);
			this->rateCandidateWithName(Name(candidateName));
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

	vector<Name>* parentNames = candidate.getParentNames();
	Name childName = candidate.getName();

	message("adding candidate named ");
	this->printCandidate(&candidate);


	// keep track of the candidate
	this->candidates[childName] = candidate;

	// keep track of the candidate's parents
	this->candidatesParents[childName] = parentNames;

	// keep track of the candidate's moving averages
	MovingAverage* averages = new MovingAverage[this->numHalfLives];
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
	message("cascading rating ");
	this->printRating(&newRating);
	message("\r\n");
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
		//currentMap = currentPair->second;
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
	Candidate* currentParent;
	set<Name>::iterator setIterator;
	vector<Name>* currentParentNames;
	unsigned int i;
	unsigned int j;
	// iterate over each newly found candidate
	for (i = 0; i < vectorToUpdate.size(); i++)
	{
		currentCandidate = vectorToUpdate[i];
		currentParentNames = currentCandidate->getParentNames();
		// add all parents of the newly found candidate
		for (j = 0; j < currentParentNames->size(); j++)
		{
			currentParent = this->getCandidateWithName((*currentParentNames)[j]);
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
double TimeBasedRecommendor::rateCandidateWithName(Name name)
{
	message("rating candidate with name: ");
	message(name.getName());
	message("\r\n");
	Candidate* candidate = this->getCandidateWithName(name);
	double rating = this->rateCandidate(candidate);
	message("done rating candidate\r\n");
	return rating;
}
double TimeBasedRecommendor::rateCandidate(Candidate* candidate)
{
	MovingAverage* shortTermAverage = candidate->getActualRatingHistory();
	map<MovingAverage*, PredictionLink>& links = predictionLinks[shortTermAverage];
	map<MovingAverage*, PredictionLink>::iterator mapIterator;
	PredictionLink* currentLink;
	Distribution* guess;
	Name predictorName, predicteeName;
	predicteeName = candidate->getName();
	for (mapIterator = links.begin(); mapIterator != links.end(); mapIterator++)
	{
		currentLink = &((*mapIterator).second);
		predictorName = (*mapIterator).first->getName();
		message("Predicting ");
		message(predicteeName.getName());
		message(" from ");
		message(predictorName.getName());
		message("\r\n");
		guess = &(currentLink->guess());
		this->printDistribution(guess);
	}
	return 0;
	//return guess->getMean();
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
