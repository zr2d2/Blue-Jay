#ifndef _NAME_H_
#define _NAME_H_
#include <string>
class Name
{
public:
	Name(void);
	Name(char* name);
	Name(std::string name);
	std::string getName(void) const;
	void appendChar(char newChar);
	void clear();
private:
	std::string value;
};
bool operator<(const Name& first, const Name& second);
bool operator==(const Name& first, const Name& second);

#endif