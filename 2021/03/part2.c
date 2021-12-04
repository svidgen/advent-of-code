#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LINE_MAX 32
#define MAX_LINES 2000

void printArray(int a[], int length) {
	printf("[");
	for (int i = 0; i < length; i++) {
		printf("%i", a[i]);
		if (i < length - 1) {
			printf(", ");
		}
	}
	printf("]\n");
}

struct Trie {
	int cardinality;
	struct Trie *zero;
	struct Trie *one;
};

struct Trie* newTrie() {
	struct Trie *t = malloc(sizeof(struct Trie));
	t->cardinality = 0;
	t->zero = NULL;
	t->one = NULL;
	return t;
}

void trieInsert(struct Trie *t, int value[], int length) {
	t->cardinality++;

	// leaf.
	if (length == 0) return;

	// non-leaf
	if (value[0] == 0) {
		if (t->zero == NULL) {
			t->zero = newTrie();
		}
		trieInsert(t->zero, value + 1, length - 1);
	} else if (value[0] == 1) {
		if (t->one == NULL) {
			t->one = newTrie();
		}
		trieInsert(t->one, value + 1, length - 1);
	}
}

int trieSearch(struct Trie *t, int value[], int max, int common) {
	if (t->cardinality == 0 || max == 0) {
		return max;
	}

	if (t->one == NULL && t->zero == NULL) {
		return max;
	}

	if (t->zero == NULL) {
		value[0] = 1;
		return trieSearch(t->one, value + 1, max - 1, common);
	}

	if (t->one == NULL) {
		value[0] = 0;
		return trieSearch(t->zero, value + 1, max - 1, common);
	}

	if (common == 0) {
		if (t->zero->cardinality <= t->one->cardinality) {
			value[0] = 0;
			return trieSearch(t->zero, value + 1, max - 1, common);
		} else {
			value[0] = 1;
			return trieSearch(t->one, value + 1, max - 1, common);
		}
	} else {
		if (t->one->cardinality >= t->zero->cardinality) {
			value[0] = 1;
			return trieSearch(t->one, value + 1, max - 1, common);
		} else {
			value[0] = 0;
			return trieSearch(t->zero, value + 1, max - 1, common);
		}
	}
}

void freeTrie(struct Trie *t) {
	if (t->one != NULL) {
		freeTrie(t->one);
	}
	
	if (t->zero != NULL) {
		freeTrie(t->zero);
	}

	free(t);
}

void printSpaces(int depth) {
	for (int i = 0; i < depth; i++) {
		printf(" ");
	}
}

void printTrie(struct Trie *t, int depth) {
	// printSpaces(depth);
	printf("%i\n", t->cardinality);

	printSpaces(depth);
	printf(" 0 -> ");
	if (t->zero != NULL) {
		printTrie(t->zero, depth + 2);
	} else {
		printf("NONE\n");
	}

	printSpaces(depth);
	printf(" 1 -> ");
	if (t->one != NULL) {
		printTrie(t->one, depth + 2);
	} else {
		printf("NONE\n");
	}
}

void reset(int array[], int length, int value) {
	for (int i = 0; i < length; i++) {
		array[i] = value;
	}
}

int binaryArrayToInt(int values[], int length) {
	int result = 0;
	for (int i = 0; i < length; i++) {
		result = result << 1;
		result = result | values[i];
	}
	return result;
}

void tallyInput(int all[], int zeros[], int ones[], int limit) {
	char c;
	int value[32];
	int index = 0;
	int line_index = 0;
	struct Trie *t = newTrie();

	while ((c = getchar()) != EOF) {
		if (c == '0') {
			value[index] = 0;
			index++;
		} else if (c == '1') {
			value[index] = 1;
			index++;
		} else {
			printf("inserting %i\n", binaryArrayToInt(value, index));
			trieInsert(t, value, index);
			index = 0;
		}
	}

	printTrie(t, 0);

	int result[32];
	int depth = 32 - trieSearch(t, result, 32, 0);
	int leastCommon = binaryArrayToInt(result, depth);
	printf("CO2 Scrubber rating: %i\n", leastCommon);

	// printf("result returned: ");
	// printArray(result, depth);
	// printf("depth returned: %i\n", depth);

	depth = 32 - trieSearch(t, result, 32, 1);
	int mostCommon = binaryArrayToInt(result, depth);
	printf("oxygen generator rating: %i\n", mostCommon);

	printf("life support rating: %i\n", mostCommon * leastCommon);

	freeTrie(t);
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


int main() {

	int all[MAX_LINES];
	int ones[LINE_MAX];
	int zeros[LINE_MAX];

	reset(zeros, LINE_MAX, 0);
	reset(ones, LINE_MAX, 0);
	reset(all, MAX_LINES, -1);

	tallyInput(all, zeros, ones, MAX_LINES);

	exit(0);
}

