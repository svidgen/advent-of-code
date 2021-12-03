#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LINE_MAX 32


void reset(int array[], int length) {
	for (int i = 0; i < length; i++) {
		array[i] = 0;
	}
}

void tallyInput(int zeros[], int ones[]) {
	char c;
	int index = 0;

	while ((c = getchar()) != EOF) {
		if (c == '0') {
			zeros[index] += 1;
		} else if (c == '1') {
			ones[index] += 1;
		} else {
			// non-binary input assumed to separate values.
			index = 0;
			continue;
		}
		index++;
	}
}

int getValue(int a[], int b[], int length) {
	int v = 0;

	for (int i = 0; i < length; i++) {
		if (a[i] == 0 && b[i] == 0) {
			break;
		}

		v = v << 1;
		if (a[i] > b[i]) {
			v = v | 1;
		}
	}

	return v;
}

void printCounts(int count[], int length) {
	printf("[");
	for (int i = 0; i < length; i++) {
		printf("%i", count[i]);
		if (i < length - 1) {
			printf(", ");
		}
	}
	printf("]\n");
}

int main() {

	int ones[LINE_MAX];
	int zeros[LINE_MAX];

	reset(zeros, LINE_MAX);
	reset(ones, LINE_MAX);

	tallyInput(zeros, ones);

	printf("zeros: ");
	printCounts(zeros, LINE_MAX);

	printf("ones: ");
	printCounts(ones, LINE_MAX);

	int gamma = getValue(ones, zeros, LINE_MAX);
	int epsilon = getValue(zeros, ones, LINE_MAX);

	printf("gamma: %i\n", gamma);
	printf("epsilon: %i\n", epsilon);
	printf("power: %i\n", gamma * epsilon);

	exit(0);
}

