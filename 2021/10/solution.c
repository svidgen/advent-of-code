#include <stdio.h>
#include <inttypes.h>
#include "../common/util.c"

u_int64_t is_opener(char c) {
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

char closer_for(char c) {
	switch(c) {
		case '[':
			return ']';
		case '{':
			return '}';
		case '<':
			return '>';
		case '(':
			return ')';
		default:
			return '\0';
	}
}

u_int64_t is_closed_pair(char open, char close) {
	if (close != '\0' && closer_for(open) == close) {
		return 1;
	} else {
		return 0;
	}
}

u_int64_t unexpected_character_score(char c) {
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

u_int64_t check_line(String * line) {
	String * stack = new_string("");

	char c;
	for (u_int64_t i = 0; i < line->length; i++) {
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

String * complete(String * line) {
	String * completion = new_string("");
	String * stack = new_string("");

	char c;
	for (u_int64_t i = 0; i < line->length; i++) {
		c = line->items[i];
		if (is_opener(c)) {
			stack->push(stack, c);
		} else {
			if (stack->length == 0) {
				// unexpected character. no completion.
				return NULL;
			} else if (is_closed_pair(stack->items[stack->length - 1], c)) {
				stack->pop(stack);
			} else {
				// unexpected character. no completion.
				return NULL;
			}
		}
	}

	while (stack->length > 0) {
		completion->push(completion, closer_for(stack->pop(stack)));
	}

	return completion;
}

u_int64_t character_score(char c) {
	switch(c) {
		case ')': return 1;
		case ']': return 2;
		case '}': return 3;
		case '>': return 4;
		default: return 0;
	}
}

u_int64_t completion_score(String * completion) {
	u_int64_t score = 0;
	for (u_int64_t i = 0; i < completion->length; i++) {
		score = score * 5 + character_score(completion->items[i]);
	}
	return score;
}

u_int64_t compare_u_int64_ts(const void * a, const void * b) {
	u_int64_t _a = *(u_int64_t*)a;
	u_int64_t _b = *(u_int64_t*)b;
	if (_a > _b) return 1;
	if (_a < _b) return -1;
	return 0;
}

void pru_int64_t_u_int64_t_array(u_int64_t items[], u_int64_t length) {
	printf("[");
	for (u_int64_t i = 0; i < length; i++) {
		printf("%" PRIu64 "", items[i]);
		if (i < length - 1) {
			printf(",");
		}
	}
	printf("]");
}

u_int64_t completions_score(array(String) * completions) {
	u_int64_t scores[completions->length];
	for (u_int64_t i = 0; i < completions->length; i++) {
		scores[i] = completion_score(&completions->items[i]);
	}
	qsort(scores, completions->length, sizeof(u_int64_t), compare_u_int64_ts);
	pru_int64_t_u_int64_t_array(scores, completions->length);
	return scores[completions->length/2];
}

u_int64_t main() {
	array(String) * lines = split(read_all(), '\n');
	array(String) * completions = new_array(String);

	printf("Scoring: \n");
	u_int64_t total = 0;
	for (u_int64_t i = 0; i < lines->length; i++) {
		String line = lines->items[i];
		u_int64_t score = check_line(&line);
		total += score;
		printf("%-40s => %" PRIu64 "\n", line.items, score);
	}
	printf("total: %" PRIu64 "\n", total);

	printf("Auto-completing:\n");
	for (u_int64_t i = 0; i < lines->length; i++) {
		String line = lines->items[i];
		if (check_line(&line) > 0) continue;
		String * completion = complete(&line);
		completions->push(completions, *completion);
		printf("%s -- %s\n", line.items, completion->items);
	}
	printf("score: %" PRIu64 "\n", completions_score(completions));
}
