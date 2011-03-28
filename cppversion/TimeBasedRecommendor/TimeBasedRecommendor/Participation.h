#ifndef _PARTICIPATION_H_
#define _PARTICIPATION_H_

#include "DateTime.h"
#include "Name.h"

// the Participation class represents an instance of listening to a song or to a song category
class Participation
{
public:
	Participation();
	void setStartTime(DateTime start);
	DateTime getStartTime(void);

	void setEndTime(DateTime end);
	DateTime getEndTime(void) const;

	void setActivityName(Name name);
	const Name& getActivityName(void);

	void setIntensity(double intensity);
	double getIntensity(void);
private:
	DateTime startTime;
	DateTime endTime;
	Name activityName;
	double value;
};

// Tells which rating comes first chronologically for the purposes of sorting
class ParticipationPrecedes
{
public:
	bool operator()(const Participation& p1, const Participation& p2);
};
#endif
