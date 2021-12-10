#include <stdio.h>

#include "../common/util.c"

define_array(int)

int main() {
	array(int) * a = new_array(int);

	array_push(int)(a, 1);
	array_push(int)(a, 2);
	array_push(int)(a, 3);

	printf("array 0: %i\n", a->items[0]);
	printf("array 1: %i\n", a->items[1]);
	printf("array 2: %i\n", a->items[2]);
}
