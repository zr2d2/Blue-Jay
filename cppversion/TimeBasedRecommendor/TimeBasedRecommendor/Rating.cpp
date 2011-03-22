#include "stdafx.h"
#include "Rating.h"

Rating::Rating(void)
{
	// save the current time
	//time(&(this->endTime));
	this->weight = 1;
}
void Rating::setActivity(Name name)
{
	this->activityName = name;
}
Name Rating::getActivity(void) const
{
	return this->activityName;
}

/*void Rating::setEndTime(DateTime time)
{
	this->endTime = time;
}
DateTime Rating::getEndTime(void) const
{
	return this->endTime;
}

void Rating::setStartTime(DateTime time)
{
	this->endTime = time;
}
DateTime Rating::getStartTime(void) const
{
	return this->endTime;
}*/

void Rating::setDate(DateTime date)
{
	this->creationDate = date;
}
const DateTime& Rating::getDate(void) const
{
	return this->creationDate;
}
void Rating::setScore(double newValue)
{
	this->score = newValue;
}
double Rating::getScore(void)
{
	return this->score;
}
void Rating::setWeight(double newWeight)
{
	this->weight = newWeight;
}
double Rating::getWeight(void)
{
	return this->weight;
}

/*void Rating::setDuration(double numHours)
{
	this->duration = numSeconds;
}*/
/*double Rating::getDuration(void)
{
	return this->startTime.timeUntil(this->endTime);
}*/

bool RatingPrecedes::operator()(const Rating& r1, const Rating& r2)
{
	DateTime t1 = r1.getDate();
	DateTime t2 = r2.getDate();
	// first sort by date
	if (strictlyChronologicallyOrdered(t1, t2))
	{
		return true;
	}
	if (strictlyChronologicallyOrdered(t2, t1))
	{
		return false;
	}
	// break ties by name
	return r1.getActivity() < r2.getActivity();
}
