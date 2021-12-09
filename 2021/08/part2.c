#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define ARRAY_INIT 100
#define ARRAY_INC 2
#define DIGIT_SIZE 20
#define INPUT_TOKENS 10
#define OUTPUT_TOKENS 4

int FINGERPRINTS[] = {
	2336, // 0
	2222, // 1
	1225, // 2
	2335, // 3
	2424, // 4
	1325, // 5
	1326, // 6
	2233, // 7
	2437, // 8
	2436  // 9
};

typedef struct {
	char one[10];
	char four[10];
	char seven[10];
} Arrangement;

typedef struct {
	int length;
	char segments[DIGIT_SIZE];
} Digit;

typedef struct {
	Digit input[INPUT_TOKENS];
	Digit output[OUTPUT_TOKENS];
	Arrangement arrangement;
} Line;

typedef struct {
	int max;
	int length;
	Line * items;
} Lines;

Lines * new_lines() {
	Lines *a = malloc(sizeof(Lines));
	a->length = 0;
	a->max = ARRAY_INIT;
	a->items = malloc(sizeof(Line) * ARRAY_INIT);
	return a;
}

int lines_push(Lines *a, Line value) {
	int resize = 0;

	if (a->length == a->max) {
		resize = a->max * ARRAY_INC;
		a->items = realloc(a->items, sizeof(Line) * resize);
		a->max = resize;
	}

	a->items[a->length] = value;
	a->length++;
	return a->length;
}

void lines_free(Lines *a) {
	free(a->items);
	free(a);
}

int is_eof_next() {
	int v = 0;
	char c = getchar();
	if (c == EOF) v = 1;
	ungetc(c, stdin);
	return v;
}

int read_number() {
	int started = 0;
	int v = 0;
	char c;
	for (int i = 0; i < 10; i++) {
		c = getchar();

		if (c >= '0' && c <= '9') {
			started = 1;
			v = v * 10 + (c - 48);
		} else {
			if (c == EOF) {
				ungetc(c, stdin);
				return v;
			}

			if (started == 0) {
				continue;
			} else {
				return v;
			}
		}
	}

	printf("Number string is too long.\n");
	exit(1);
}

// Watch out! Zero error handling for input below!
// I hope our input is clean!

Digit read_digit() {
	int first_segment_found = 0;
	char c;

	Digit v = {
		.length = 0
	};

	printf("parsing a digit\n");

	while (1) {
		c = getchar();
		printf("got char %c ... ", c);

		if (c >= 'a' && c <= 'g') {
			printf("between a and g\n");
			first_segment_found = 1;
			v.segments[v.length] = c;
			v.length++;
		} else {
			printf("NOT between a and g ... ");
			if (first_segment_found) {
				v.segments[v.length] = '\0';
				printf("returning '%s'\n\n", v.segments);
				return v;
			}
			printf("\n");
		}
	}

	if (is_eof_next()) {
		printf("is eof next in read digit\n");
		return v;
	}

	printf("No valid digit was found!\n");
	exit(1);
}

Arrangement ingest_digit(Arrangement a, Digit d) {
	switch (d.length) {
		case 2:
			strncpy(a.one, d.segments, 2);
			break;
		case 4:
			strncpy(a.four, d.segments, 4);
			break;
		case 3:
			strncpy(a.seven, d.segments, 3);
			break;
		default:
			break;
	}
	return a;
}

Line read_line() {
	Line line;
	Arrangement a;

	for (int i = 0; i < INPUT_TOKENS; i++) {
		line.input[i] = read_digit();
		a = ingest_digit(a, line.input[i]);
	}

	for (int i = 0; i < OUTPUT_TOKENS; i++) {
		line.output[i] = read_digit();
		a = ingest_digit(a, line.output[i]);
	}

	line.arrangement = a;
	return line;
}

Lines * read_lines() {
	Lines * lines = new_lines();
	while (!is_eof_next()) {
		lines_push(lines, read_line());
	}
	return lines;
}

int common_segments(char s[], Digit d) {
	int count = 0;
	for (int i = 0; s[i] != '\0'; i++) {
		for (int j = 0; j < d.length; j++) {
			if (s[i] == d.segments[j]) count++;
		}
	}
	return count;
}

int fingerprint(Arrangement a, Digit d) {
	return common_segments(a.one, d) * 1000
		+ common_segments(a.four, d) * 100
		+ common_segments(a.seven, d) * 10
		+ d.length
	;
}

int digit_value(Arrangement a, Digit d) {
	int p = fingerprint(a, d);

	for (int v = 0; v < 10; v++) {
		if (FINGERPRINTS[v] == p) {
			return v;
		}
	}

	printf("Digit could not be fingerprinted! %s\n", d.segments);
	exit(1);
}

int print_line(Line line) {
	int total = 0;

	printf("input: [");
	for (int i = 0; i < INPUT_TOKENS; i++) {
		Digit d = line.input[i];
		printf("%s (%i)", d.segments, digit_value(line.arrangement, d));
		if (i + 1 < INPUT_TOKENS) {
			printf(", ");
		}
	}

	printf("]\noutput: [");
	for (int i = 0; i < OUTPUT_TOKENS; i++) {
		Digit d = line.output[i];

		int v = digit_value(line.arrangement, d);
		total += (1000 / pow(10, i)) * v;

		printf("%s (%i)", d.segments, v);
		if (i + 1 < OUTPUT_TOKENS) {
			printf(", ");
		}
	}

	printf("] => %i\nArrangement: [1 => %s, 4 => %s, 7 => %s]\n\n",
		total,
		line.arrangement.one,
		line.arrangement.four,
		line.arrangement.seven
	);

	return total;
}

int print_lines(Lines * lines) {
	int total = 0;
	for (int i = 0; i < lines->length; i++) {
		total += print_line(lines->items[i]);
	}
	printf("\n");
	return total;
}

int main() {
	printf("loading data ... \n\n");
	Lines * lines = read_lines();
	int total = print_lines(lines);
	printf("total: %i\n", total);
}
