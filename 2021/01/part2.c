#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LINE_MAX 16
#define TAIL_LENGTH 4 

void pushValue(int q[], int value, int q_length) {
	for (int i = 0; i < q_length - 1; i++) {
		q[i] = q[i + 1];
	}
	q[q_length - 1] = value;
}

int arraySum(int tail[], int s, int l) {
	int sum = 0;
	for (int i = s; i < l; i++) {
		sum += tail[i];
	}
	return sum;
}

int isIncrease(int values[], int length) {
	return (arraySum(values, 0, length - 1) < arraySum(values, 1, length));
}

void printArray(int values[], int length) {
	printf("[");
	for (int i = 0; i < length; i++) {
		printf("%i", values[i]);
		if (i < length - 1) {
			printf(", ");
		}
	}
	printf("]\n");
}

int main() {

	char *remainder;
	char buffer[LINE_MAX];

	int charactersSeen = 0;
	int tail[TAIL_LENGTH];
	int count = 0;

	for (int i = 0; i < TAIL_LENGTH; i++) {
		tail[i] = 0;
	}

	while (fgets(buffer, sizeof buffer, stdin)) {
		// remove trailing \0
		buffer[strlen(buffer) - 1] = 0;

		// convert buffer to int, storing any leftover chars in remainder
		// base 10 conversion
		int currentValue = strtol(buffer, &remainder, 10);
		charactersSeen++;

		pushValue(tail, currentValue, TAIL_LENGTH);
		// printArray(tail, TAIL_LENGTH);

		if (charactersSeen >= TAIL_LENGTH && isIncrease(tail, TAIL_LENGTH)) {
			count++;
		}
	}

	printf("%d\n", count);
	exit(0);
}

