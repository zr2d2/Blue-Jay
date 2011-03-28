#ifndef PARTICIPATION_MOVING_AVERAGE_H_
#define PARTICIPATION_MOVING_AVERAGE_H_

#include "MovingAverage.h"

// The ParticipationMovingAverage class represents the progression of listening frequency of a song over time
class ParticipationMovingAverage : public MovingAverage
{
public:
	ParticipationMovingAverage();
	void addParticipationInterval(Participation interval);
	//void setHalfLife(double newHalfLife);
	std::pair<Distribution, int> getValueAt(DateTime when, bool strictlyEarlier);
	Distribution getCurrentValue(DateTime when, bool strictlyEarlier) override;	// if strictlyEarlier is true, then it will only use data from strictly before 'when'
	bool isAParticipationMovingAverage(void) override;		// for determining if its type is ParticipationMovingAverage or not
	DateTime getLatestDate(void) override;
	int getNumParticipations(void);
private:
	int getIndexForDate(DateTime when, bool strictlyEarlier);
	double getTotalIntensityThroughDate(DateTime when);
	//double halfLife;
	std::vector<Participation> totalIntensities;
};
#endif