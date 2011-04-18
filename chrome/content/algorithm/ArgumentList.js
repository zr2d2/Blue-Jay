
/**
 *  ArgumentList object
 */
 
function ArgumentList(argc, argv) {
	//public function prototypes
	this.getNumArguments = getNumArguments;
	this.getArgument = getArgument;
	
	//private variables 
	var numArguments = argc | 0;
	var argumentValues = argv | {};
	
	//public functions
	function getNumArguments() {
		return numArguments;
	}
	
	function getArgument(index) {
		return argumentValues[index];
	}
	
	
};