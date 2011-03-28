#include "stdafx.h"
#include "Participation.h"

// the Participation class represents an instance of listening to a song or to a song category
Participation::Participation()
{
	this->value = 1;
}
void Participation::setStartTime(DateTime start)
{
	this->startTime = start;
}
DateTime Participation::getStartTime(void)
{
	return this->startTime;
}

void Participation::setEndTime(DateTime end)
{
	this->endTime = end;
}
DateTime Participation::getEndTime(void) const
{
	return this->endTime;
}

void Participation::setActivityName(Name name)
{
	this->activityName = name;
}
const Name& Participation::getActivityName(void)
{
	return this->activityName;
}

void Participation::setIntensity(double intensity)
{
	this->value = intensity;
}
double Participation::getIntensity(void)
{
	return this->value;
}

bool ParticipationPrecedes::operator()(const Participation& p1, const Participation& p2)
{
	if (strictlyChronologicallyOrdered(p1.getEndTime(), p2.getEndTime()))
		return true;
	else
		return false;
}