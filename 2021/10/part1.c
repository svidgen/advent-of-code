#include <stdio.h>
#include "../common/util.c"

// -1 = incomplete
//  0 = valid
// >0 = invalid
int check_line(String * line) {
	return 0;
}

int main() {
	array(String) * lines = split(read_all(), '\n');

	printf("Scoring: \n");
	int total = 0;
	for (int i = 0; i < lines->length; i++) {
		String line = lines->items[i];
		int score = check_line(&line);
		printf("%-70s => %i\n", line.items, score);
	}
}
