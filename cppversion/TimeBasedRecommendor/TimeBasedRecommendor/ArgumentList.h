#ifndef _ARGUMENT_LIST_H_
#define _ARGUMENT_LIST_H_

// The ArgumentList class represents a list of arguments
// It's essentially a vector of strings
class ArgumentList
{
public:
	ArgumentList(int argc, char* argv[]);
	~ArgumentList();
	int getNumArguments(void);
	char* getArgument(int index);
private:
	int numArguments;
	char** argumentValues;
};
#endif