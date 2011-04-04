#ifndef _DATE_TIME_H_
#define _DATE_TIME_H_

#include <string>

// simple class that holds date and time
class DateTime
{
public:
	// constructor
	DateTime(void);
	DateTime(std::string yyyymmddhhmmss);
	// create a new date equal to this date plus numSeconds
	DateTime datePlusDuration(double numSeconds);
	// return a string representating this date, in yyyy-mm-ddThh:mm:ss format
	std::string stringVersion(void) const;
	// the number of seconds from this to other
	double timeUntil(const DateTime& other) const;
private:
	// make this date equal to the date indicated by the datestring, for example, 2011-3-27T23:20:00
	void setComponents(std::string yyyymmddhhmmss);
	time_t value;
};
// returns true if t1 comes before t2, and false if t2 is equal to or after t1
bool strictlyChronologicallyOrdered(const DateTime& t1, const DateTime& t2);
#endif