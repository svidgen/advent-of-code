#include <stdlib.h>
#include <stdio.h>

#define min(A, B) ((A) < (B) ? (A) : (B))
#define max(A, B) ((A) > (B) ? (A) : (B))

#define CAT(A, B) A ## _ ## B

#define ARRAY_INIT_SIZE 100
#define ARRAY_GROWTH_FACTOR 2

#define define_array(T) typedef struct Array_of_ ## T { \
		int length; \
		int max; \
		int (*push)(struct Array_of_ ## T * a, T item); \
		T (*pop)(struct Array_of_ ## T * a); \
		T *items; \
	} Array_of_ ## T; \
	int array_push_ ## T (Array_of_ ## T * a, T item) { \
		int resize = 0; \
		if (a->length == a->max - 1) { \
			resize = a->max * ARRAY_GROWTH_FACTOR; \
			a->items = realloc(a->items, sizeof(T) * resize); \
			a->max = resize; \
		} \
		a->items[a->length] = item; \
		/* a->items[a->length + 1] = 0; */ \
		a->length++; \
		return a->length; \
	} \
	T array_pop_ ## T (Array_of_ ## T * a) { \
		T item = a->items[a->length - 1]; \
		a->length--; \
		return item; \
	} \
	Array_of_ ## T * new_array_ ## T () { \
		Array_of_ ## T * arr = malloc(sizeof(Array_of_ ## T)); \
		arr->length = 0; \
		arr->max = ARRAY_INIT_SIZE; \
		arr->push = array_push_ ## T; \
		arr->pop = array_pop_ ## T; \
		arr->items = malloc(sizeof(T) * ARRAY_INIT_SIZE); \
		return arr; \
	} \
	Array_of_ ## T * new_array_init_ ## T (int length, T items[]) { \
		Array_of_ ## T * arr = new_array(T); \
		for (int i = 0; i < length; i++) { \
			array_push_ ## T (arr, items[i]); \
		} \
		return arr; \
	}\
	void array_free_ ## T (Array_of_ ## T * a) { \
		free(a->items); \
		free(a); \
	}

#define array(T) Array_of_ ## T

#define new_array(T) new_array_ ## T()
#define array_init(T) new_array_init_ ## T
#define array_push(T) array_push_ ## T
#define array_pop(T) array_pop_ ## T

define_array(char)

#define new_string(S) array_init(char)((sizeof((S))/sizeof(char)) - 1, (S))
typedef array(char) String;

String * read_all() {
	char c;
	String * s = new_string("");
	while ((c = getchar()) != EOF) {
		s->push(s, c);
	}
	return s;
}

define_array(String)

array(String) * split(String * text, char delimiter) {
	array(String) * lines = new_array(String);
	String * line = new_string("");

	for (int i = 0; i < text->length; i++) {
		if (text->items[i] == delimiter) {
			lines->push(lines, *line);
			line = new_string("");
		} else {
			line->push(line, text->items[i]);
		}
	}

	return lines;
}
