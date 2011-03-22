#ifndef _RATING_H_
#define _RATING_H_

#include <time.h>
#include "Name.h"
#include "DateTime.h"

class Rating
{
public:
	Rating(void);
	void setActivity(Name name);
	Name getActivity(void) const;

	//void setEndTime(DateTime time);
	//DateTime getEndTime(void) const;

	//void setStartTime(DateTime time);
	//DateTime getStartTime(void) const;

	void setDate(DateTime time);
	const DateTime& getDate(void) const;

	void setScore(double newValue);
	double getScore(void);

	void setWeight(double newWeight);
	double getWeight(void);

	//void setDuration(double numHours);
	//double getDuration(void);
private:
	Name activityName;
	//DateTime endTime;
	//DateTime startTime;
	DateTime creationDate;
	double score;
	double duration;
	double weight;
};

// Tells which rating comes first chronologically for the purposes of sorting
class RatingPrecedes
{
public:
	bool operator()(const Rating& r1, const Rating& r2);
};
#endif