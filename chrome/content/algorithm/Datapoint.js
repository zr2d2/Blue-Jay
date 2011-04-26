/**
 *  Datapoint object
 */

// simple class with x, y, and weight
function Datapoint(x, y, weight){

    //public function prototypes
    this.getX = getX;
    this.getY = getY;
    this.getWeight = getWeight;

    //private variables 
    var itsX = x;
    var itsY = y;
    var itsWeight = weight;

    function getX(){
        return itsX;
    }

    function getY(){
        return itsY;
    }

    function getWeight(){
        return itsWeight;
    }
};

