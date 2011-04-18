
/**
 *  Distribution object
 */
 
function Distribution(average, stdDev, relativeWidth) {
	//public function prototypes
	this.getMean = getMean;
	this.getStdDev = getStdDev;
	this.getWeight = getWeight;
	
	//private variables 
	var mean = average | 0;
	var standardDeviation = stdDev | 0;
	var weight = relativeWidth | 0;
	
	//public functions
	function getMean() {
		return mean;
	}
	
	function getStdDev() {
		return standardDeviation;
	}
	
	function getWeight() {
		return weight;
	}
};