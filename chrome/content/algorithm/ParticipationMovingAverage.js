
/**
 * The class that represents the value of a variable over time
 */
 
function ParticipationMovingAverage() {
/////////////////////////////////////////////////// Private Member Variables ///////////////////////////////////////////////////
	var totalIntensities = []

/////////////////////////////////////////////////// Function Prototypes ///////////////////////////////////////////////////
    this.getIndexForDate = getIndexForDate;
    this.getTotalIntensityThroughDate = getTotalIntensityThroughDate;
	this.addParticipationInterval = addParticipationInterval;
	this.getValueAt = getValueAt;
	this.getCurrentValue = getValueAt;  // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;		// for determining if its type is ParticipationMovingAverage or not
	this.getLatestDate = getLatestDate;
	this.getNumParticipations = getNumParticipations;
	
/////////////////////////////////////////////////// Function Definitions ///////////////////////////////////////////////////
	function getIndexForDate {
	    
	}
}