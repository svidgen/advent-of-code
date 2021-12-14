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
		void (*free)(struct Array_of_ ## T * a); \
		T *items; \
	} Array_of_ ## T; \
	void array_free_ ## T (Array_of_ ## T * a); \
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
		arr->free = array_free_ ## T; \
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

	lines->push(lines, *line);
	return lines;
}

array(String) * remove_empty(array(String) * raw) {
	array(String) * lines = new_array(String);
	for (int i = 0; i < raw->length; i++) {
		String line = raw->items[i];
		if (line.length > 0) {
			lines->push(lines, line);
		}
	}
	return lines;
}

int string_matches_at(String * needle, String * haystack, int index) {
	if ((index + needle->length) >= haystack->length) return 0;
	for (int i = 0; i < needle->length; i++) {
		if (needle->items[i] != haystack->items[i + index]) return 0;
	}
	return 1;
}

int strings_equal(String * a, String * b) {
	if (a->length != b->length) return 0;
	for (int i = 0; i < a->length; i++) {
		if (a->items[i] != b->items[i]) return 0;
	}
	return 1;
}

int string_starts_with(String * needle, String * haystack) {
	return string_matches_at(needle, haystack, 0);
}

int string_index_of(String * needle, String * haystack) {
	for (int i = 0; i < (haystack->length - needle->length); i++) {
		if (string_matches_at(needle, haystack, i)) {
			return i;
		}
	}
	return -1;
}

String * substring(String * s, int index, int length) {
	String * new_string = new_string("");
	int max_i = length < 0 ? s->length : min(index + length, s->length);
	for (int i = index; i < max_i; i++) {
		new_string->push(new_string, s->items[i]);
	}
	return new_string;
}

char * chars(String * s) {
	char * c = malloc(sizeof(char) * s->length + 1);
	for (int i = 0; i < s->length; i++) {
		c[i] = s->items[i];
	}
	return c;
}

#define define_dict(T) typedef struct Dict_of_ ## T { \
		T * value; \
		struct Dict_of_ ## T * bucket[256]; \
		void (*set)(struct Dict_of_ ## T * d, char key[], T item); \
		T (*get)(struct Dict_of_ ## T * d, char key[]); \
		int (*has)(struct Dict_of_ ## T * d, char key[]); \
		void (*free)(struct Dict_of_ ## T * d); \
	} Dict_of_ ## T; \
	\
	void dict_set_ ## T (struct Dict_of_ ## T * d, char key[], T item); \
	T dict_get_ ## T (struct Dict_of_ ## T * d, char key[]); \
	int dict_has_ ## T (struct Dict_of_ ## T * d, char key[]); \
	void dict_free_ ## T (struct Dict_of_ ## T * d); \
	\
	Dict_of_ ## T * new_dict_ ## T () { \
		Dict_of_ ## T * d = malloc(sizeof(Dict_of_ ## T)); \
		for (int i = 0; i < 256; i++) { \
			d->bucket[i] = NULL; \
		} \
		d->value = malloc(sizeof(T)); \
		d->set = dict_set_ ## T; \
		d->get = dict_get_ ## T; \
		d->has = dict_has_ ## T; \
		d->free = dict_free_ ## T; \
		return d; \
	} \
	\
	void dict_set_ ## T (Dict_of_ ## T * d, char key[], T item) { \
		if (strlen(key) == 0) {\
			*(d->value) = item; \
		} else { \
			if (d->bucket[key[0]] == NULL) { \
				d->bucket[key[0]] = new_dict(T); \
			} \
			dict_set_ ## T(d->bucket[key[0]], key + 1, item); \
		} \
	} \
	\
	T dict_get_ ## T (Dict_of_ ## T * d, char key[]) { \
		if (strlen(key) == 0) { \
			return *(d->value); \
		} else { \
			return dict_get_ ## T(d->bucket[key[0]], key + 1); \
		} \
	} \
	\
	int dict_has_ ## T (Dict_of_ ## T * d, char key[]) { \
		if (strlen(key) == 0) { \
			return d->value == NULL ? 0 : 1; \
		} else if (d->bucket[key[0]] == NULL) { \
			return 0; \
		} else { \
			return dict_has_ ## T(d->bucket[key[0]], key + 1); \
		} \
	} \
	\
	void dict_free_ ## T (Dict_of_ ## T * d) { \
		if (d->value != NULL) free(d->value); \
		for (int i = 0; i < 256; i++) { \
			if (d->bucket[i] != NULL) { \
				d->free(d->bucket[i]); \
				free(d->bucket[i]); \
			} \
		} \
	}


#define new_dict(T) new_dict_ ## T()
#define dict(T) Dict_of_ ## T


#define define_map(T) typedef struct Map_of_ ## T { \
		array(T) * value; \
		struct Map_of_ ## T * bucket[256]; \
		void (*set)(struct Map_of_ ## T * d, char key[], T item); \
		array(T) * (*get)(struct Map_of_ ## T * d, char key[]); \
		int (*has)(struct Map_of_ ## T * d, char key[]); \
		void (*free)(struct Map_of_ ## T * d); \
	} Map_of_ ## T; \
	\
	void map_set_ ## T (struct Map_of_ ## T * d, char key[], T item); \
	array(T) * map_get_ ## T (struct Map_of_ ## T * d, char key[]); \
	int map_has_ ## T (struct Map_of_ ## T * d, char key[]); \
	void map_free_ ## T (struct Map_of_ ## T * d); \
	\
	Map_of_ ## T * new_map_ ## T () { \
		Map_of_ ## T * d = malloc(sizeof(Map_of_ ## T)); \
		for (int i = 0; i < 256; i++) { \
			d->bucket[i] = NULL; \
		} \
		d->value = new_array(T); \
		d->set = map_set_ ## T; \
		d->get = map_get_ ## T; \
		d->has = map_has_ ## T; \
		d->free = map_free_ ## T; \
		return d; \
	} \
	\
	void map_set_ ## T (Map_of_ ## T * d, char key[], T item) { \
		if (strlen(key) == 0) {\
			d->value->push(d->value, item); \
		} else { \
			if (d->bucket[key[0]] == NULL) { \
				d->bucket[key[0]] = new_map(T); \
			} \
			map_set_ ## T(d->bucket[key[0]], key + 1, item); \
		} \
	} \
	\
	array(T) * map_get_ ## T (Map_of_ ## T * d, char key[]) { \
		if (strlen(key) == 0) { \
			return d->value; \
		} else { \
			return map_get_ ## T(d->bucket[key[0]], key + 1); \
		} \
	} \
	\
	int map_has_ ## T (Map_of_ ## T * d, char key[]) { \
		if (strlen(key) == 0) { \
			return d->value != NULL && d->value->length > 0 ? 1 : 0; \
		} else if (d->bucket[key[0]] == NULL) { \
			return 0; \
		} else { \
			return map_has_ ## T(d->bucket[key[0]], key + 1); \
		} \
	} \
	\
	void map_free_ ## T (Map_of_ ## T * d) { \
		if (d->value != NULL) d->value->free(d->value); \
		for (int i = 0; i < 256; i++) { \
			if (d->bucket[i] != NULL) { \
				d->free(d->bucket[i]); \
				free(d->bucket[i]); \
			} \
		} \
	}


#define new_map(T) new_map_ ## T()
#define map(T) Map_of_ ## T


