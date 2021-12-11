#include <stdio.h>
#include "../common/util.c"

int is_opener(char c) {
	switch(c) {
		case '[':
		case '<':
		case '(':
		case '{':
			return 1;
		default:
			return 0;
	}
}

int is_closed_pair(char open, char close) {
	switch(open) {
		case '[':
			return close == ']' ? 1 : 0;
		case '{':
			return close == '}' ? 1 : 0;
		case '<':
			return close == '>' ? 1 : 0;
		case '(':
			return close == ')' ? 1 : 0;
		default:
			return 0;
	}
}

int unexpected_character_score(char c) {
	switch(c) {
		case ')':
			return 3;
		case ']':
			return 57;
		case '}':
			return 1197;
		case '>':
			return 25137;
		default:
			printf("No score available for %c\n", c);
			exit(1);
	}
}

int check_line(String * line) {
	String * stack = new_string("");

	char c;
	for (int i = 0; i < line->length; i++) {
		c = line->items[i];
		if (is_opener(c)) {
			stack->push(stack, c);
		} else {
			if (stack->length == 0) {
				return unexpected_character_score(c);
			} else if (is_closed_pair(stack->items[stack->length - 1], c)) {
				stack->pop(stack);
			} else {
				return unexpected_character_score(c);
			}
		}
	}

	return 0;
}

int main() {
	array(String) * lines = split(read_all(), '\n');

	printf("Scoring: \n");
	int total = 0;
	for (int i = 0; i < lines->length; i++) {
		String line = lines->items[i];
		int score = check_line(&line);
		total += score;
		printf("%-40s => %i\n", line.items, score);
	}
	printf("total: %i\n", total);
}
