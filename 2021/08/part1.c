#include <stdio.h>
#include <stdlib.h>

#define ARRAY_INIT 100
#define ARRAY_INC 2
#define DIGIT_SIZE 20
#define INPUT_TOKENS 10
#define OUTPUT_TOKENS 4

char SEGMENTS[] = {'a', 'b', 'c', 'd', 'e', 'f'};

typedef struct {
	int length;
	char segments[DIGIT_SIZE];
} Digit;

typedef struct {
	Digit input[INPUT_TOKENS];
	Digit output[OUTPUT_TOKENS];
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

Line read_line() {
	Line line;

	for (int i = 0; i < INPUT_TOKENS; i++) {
		line.input[i] = read_digit();
	}

	for (int i = 0; i < OUTPUT_TOKENS; i++) {
		line.output[i] = read_digit();
	}

	return line;
}

Lines * read_lines() {
	Lines * lines = new_lines();
	while (!is_eof_next()) {
		lines_push(lines, read_line());
	}
	return lines;
}

void print_line(Line line) {
	printf("input: [");
	for (int i = 0; i < INPUT_TOKENS; i++) {
		printf("%s", line.input[i].segments);
		if (i + 1 < INPUT_TOKENS) {
			printf(", ");
		}
	}

	printf("]\noutput: [");
	for (int i = 0; i < OUTPUT_TOKENS; i++) {
		printf("%s", line.output[i].segments);
		if (i + 1 < OUTPUT_TOKENS) {
			printf(", ");
		}
	}
	printf("]\n");
}

void print_lines(Lines * lines) {
	for (int i = 0; i < lines->length; i++) {
		print_line(lines->items[i]);
	}
	printf("\n");
}

int digit_value(Digit d) {
	if (d.length == 2) return 1;
	if (d.length == 4) return 4;
	if (d.length == 3) return 7;
	if (d.length == 7) return 8;
	return -1;
}

int count(Lines * lines) {
	int hits = 0;
	for (int i = 0; i < lines->length; i++) {
		Line line = lines->items[i];
		for (int j = 0; j < OUTPUT_TOKENS; j++) {
			Digit d = line.output[j];
			int v = digit_value(d);
			if (v == 1 || v == 4 || v == 7 || v == 8) {
				hits++;
			}
		}
	}
	return hits;
}

int main() {
	printf("loading data ... \n\n");
	Lines * lines = read_lines();
	print_lines(lines);
	printf("data loaded.\n\n");
	printf("count: %i\n\n", count(lines));
}
