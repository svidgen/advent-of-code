#include <stdlib.h>

#define min(A, B) ((A) < (B) ? (A) : (B))
#define max(A, B) ((A) > (B) ? (A) : (B))

#define ARRAY_INIT_SIZE 100
#define ARRAY_GROWTH_FACTOR 2

#define define_array(T) typedef struct { \
		int length; \
		int max; \
		T *items; \
	} Array_of_ ## T; \
	\
	Array_of_ ## T * new_array_ ## T () { \
		Array_of_ ## T * arr = malloc(sizeof(Array_of_ ## T)); \
		arr->length = 0; \
		arr->max = ARRAY_INIT_SIZE; \
		arr->items = malloc(sizeof(T) * ARRAY_INIT_SIZE); \
		return arr; \
	} \
	int array_push_ ## T (Array_of_ ## T * a, T item) { \
		int resize = 0; \
		if (a->length == a->max) { \
			resize = a->max * ARRAY_GROWTH_FACTOR; \
			a->items = realloc(a->items, sizeof(T) * resize); \
			a->max = resize; \
		} \
		a->items[a->length] = item; \
		a->length++; \
		return a->length; \
	} \
	void array_free_ ## T (Array_of_ ## T * a) { \
		free(a->items); \
		free(a); \
	}

#define array(T) Array_of_ ## T

#define new_array(T) new_array_ ## T()
#define array_push(T) array_push_ ## T
