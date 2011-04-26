/**
 *  Rating object
 */

//the Rating object is a score that is assigned to a certain Candidate at a certain time
function Rating() {
    //public function prototypes
    this.setActivity = setActivity;
    this.getActivity = getActivity;
    this.setDate = setDate;
    this.getDate = getDate;
    this.setScore = setScore;
    this.getScore = getScore;
    this.setWeight = setWeight;
    this.getWeight = getWeight;

    //private variables 
    var activityName;
    var creationDate;
    var score;
    var duration;
    var weight = 1;

    //public functions
    function setActivity(name){
        activityName = name;
    }

    function getActivity(){
        return activityName;
    }

    function setDate(date){
        creationDate = date;
    }

    function getDate(){
        return creationDate;
    }

    function setScore(newValue){
        score = newValue;
    }

    function getScore(){
        return score;
    }

    function setWeight(newWeight){
        weight = newWeight;
    }

    function getWeight(){
        return weight;
    }
};

// Tells which rating comes first chronologically for the purposes of sorting
function RatingPrecedes() {
    //public function prototypes
    this.operator = operator;

    //public functions
    //create a new date equal to this date plus numSeconds
    function operator(r1, r2){
        var t1 = r1;
        var t2 = r2;

        // first sort by date
        if (strictlyChronologicallyOrdered(t1, t2)){
            return true;
        }

        if (strictlyChronologicallyOrdered(t2, t1)){
            return false;
        }

        // break ties by name
        return r1.getActivity() < r2.getActivity();
    }
};
