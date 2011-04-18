
/**
 * Participation object
 */
 
function Participation() {
	//public function prototypes
	this.setStartTime = setStartTime;
	this.getStartTime = getStartTime;
	this.setEndTime = setEndTime;
	this.getEndTime = getEndTime;
	this.setActivityName = setActivityName;
	this.getActivityName = getActivityName;
	this.setIntensity = setIntensity;
	this.getIntensity = getIntensity;
	
	//private variables 
	var value = 1;
	var startTime = new DateTime();
	var endTime = new DateTime();
	var activityName = new Name();
	
	//public functions
	function setStartTime(start) {
		startTime = start;
	}
	
	function getStartTime() {
		return startTime;
	}
	
	function setEndTime(end) {
		endTime = end;
	}
	
	function getEndTime() {
		return endTime;
	}
	
	function setActivityName(name) {
		activityName = name;
	}
	
	function getActivityName() {
		return activityName;
	}
	
	function setIntensity(intensity) {
		value = intensity;
	}
	
	function getIntensity() {
		return value;
	}
	
	
};

function ParticipationPrecedes(p1, p2) {
	//public function
	if(strictlyChronologicallyOrdered(p1.getEndTime(), p2.getEndTime()))
		return true;
	return false;

};