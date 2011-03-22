#ifndef _SCATTER_PLOT_H_
#define _SCATTER_PLOT_H_

#include "Distribution.h"
#include <vector>
#include "Datapoint.h"

class ScatterPlot
{
public:
	ScatterPlot();
	void addDataPoint(Datapoint& datapoint);
	Distribution predict(double x);
private:
	std::vector<Datapoint> datapoints;
	std::vector<Datapoint> debugHistory;
	ScatterPlot* upperChild;
	ScatterPlot* lowerChild;
};
#endif