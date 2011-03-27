#ifndef PARTICIPATION_MOVING_AVERAGE_H_
#define PARTICIPATION_MOVING_AVERAGE_H_

#include "MovingAverage.h"

class ParticipationMovingAverage : public MovingAverage
{
public:
	ParticipationMovingAverage();
	void addParticipationInterval(Participation interval);
	//void setHalfLife(double newHalfLife);
	Distribution getValueAt(DateTime when, bool strictlyEarlier);
	bool isAParticipationMovingAverage(void) override;		// for determining if its type is ParticipationMovingAverage or not
private:
	int getIndexForDate(DateTime when, bool strictlyEarlier);
	double getTotalIntensityThroughDate(DateTime when);
	//double halfLife;
	std::vector<Participation> totalIntensities;
};
#endif