#ifndef _DATE_TIME_H_
#define _DATE_TIME_H_

#include <string>

class DateTime
{
public:
	DateTime(void);
	DateTime(std::string yyyymmddhhmmss);
	DateTime datePlusDuration(double numSeconds);
	void setComponents(std::string yyyymmddhhmmss);
	std::string stringVersion(void) const;
	double timeUntil(const DateTime& other) const;
private:
	time_t value;
};
bool strictlyChronologicallyOrdered(const DateTime& t1, const DateTime& t2);
#endif