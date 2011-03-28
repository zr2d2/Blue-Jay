#include "stdafx.h"
#include "Name.h"
using namespace std;

// the Name class serves essentially the same purpose as the std::string class
Name::Name(void)
{
	//this->value = NULL;
}
Name::Name(char* name)
{
	string stringName = string(name);
	this->value = stringName;
}
Name::Name(string name)
{
	this->value = name;
}
string Name::getName(void) const
{
	return this->value;
}
void Name::appendChar(char newChar)
{
	//printf("%c", newChar);
	this->value.push_back(newChar);
	//printf(this->value);
	//this->value.append(string("%c", newChar));
}
void Name::clear(void)
{
	this->value.clear();
}

bool operator<(const Name& first, const Name& second)
{
	return (first.getName() < second.getName());
}
bool operator==(const Name& first, const Name& second)
{
	//printf("first=%s, second=%s", first.getName().c_str(), second.getName().c_str());
	if (first.getName() == second.getName())
	{
		//printf(" both are the same \r\n");
		return true;
	}
	else
	{
		//printf(" they are different \r\n");
		return false;
	}
}
