#include <stdlib.h>
#include <stdio.h>
#include <string.h>

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

#define define_dict(T) typedef struct Dict_of_ ## T { \
		T * value; \
		struct Dict_of_ ## T * bucket[256]; \
		T* (*set)(struct Dict_of_ ## T * d, char key[], T item); \
		T* (*get)(struct Dict_of_ ## T * d, char key[]); \
	} Dict_of_ ## T; \
	\
	T * dict_set_ ## T (struct Dict_of_ ## T * d, char key[], T item); \
	T * dict_get_ ## T (struct Dict_of_ ## T * d, char key[]); \
	\
	Dict_of_ ## T * new_dict_ ## T () { \
		Dict_of_ ## T * d = malloc(sizeof(Dict_of_ ## T)); \
		for (int i = 0; i < 256; i++) { \
			d->bucket[i] = NULL; \
		} \
		d->value = NULL; \
		d->set = dict_set_ ## T; \
		d->get = dict_get_ ## T; \
		return d; \
	} \
	\
	T * dict_set_ ## T (Dict_of_ ## T * d, char key[], T item) { \
		if (strlen(key) == 0) {\
			T * replaced_value = d->value; \
			d->value = malloc(sizeof(T)); \
			*(d->value) = item; \
			return replaced_value; \
		} else { \
			if (d->bucket[key[0]] == NULL) { \
				d->bucket[key[0]] = new_dict(T); \
			} \
			return dict_set_ ## T(d->bucket[key[0]], key + 1, item); \
		} \
	} \
	\
	T * dict_get_ ## T (Dict_of_ ## T * d, char key[]) { \
		if (strlen(key) == 0 || d->bucket[key[0]] == NULL) { \
			return d->value; \
		} else { \
			return dict_get_ ## T(d->bucket[key[0]], key + 1); \
		} \
	}


#define new_dict(T) new_dict_ ## T()
#define dict(T) Dict_of_ ## T


