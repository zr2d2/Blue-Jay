#ifndef _ARGUMENT_LIST_H_
#define _ARGUMENT_LIST_H_

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