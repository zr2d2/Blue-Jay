#ifndef _SCATTER_PLOT_H_
#define _SCATTER_PLOT_H_

#include "Distribution.h"
#include <vector>
#include "Datapoint.h"

// the ScatterPlot represents a bunch of Datapoints that have x, y, and weight
// It is used to predict y from x
// Currently it uses nearby x-values atlthough it may later be changed to compute the least-squares-regression-line
class ScatterPlot
{
public:
	ScatterPlot();
	void addDataPoint(Datapoint& datapoint);
	Distribution predict(double x);
	int getNumPoints(void);
private:
	std::vector<Datapoint> datapoints;
	std::vector<Datapoint> debugHistory;
	ScatterPlot* upperChild;
	ScatterPlot* lowerChild;
	double totalWeight;
};
#endif