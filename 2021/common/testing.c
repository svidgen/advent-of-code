#include <stdio.h>

#include "./util.c"

define_array(int)
define_dict(int)

int main() {
	array(int) * a = new_array(int);

	// supports both of these syntaxes
	a->push(a, 1);
	array_push(int)(a, 2);
	a->push(a, 3);

	//
	// can macro args span multiple lines?
	
	CAT(
		array,
		push
	)(int)(a, 4);

	// ... why yes, it appears they can ...
	//

	printf("array 0: %i\n", a->items[0]);
	printf("array 1: %i\n", a->items[1]);
	printf("array 2: %i\n", a->items[2]);
	printf("array 4: %i\n", a->items[3]);

	String * s = new_string("abc");
	s->push(s, 'd');

	printf("string: %s\n", s->items);

	//
	// dict test
	//
	
	dict(int) * d = new_dict(int);
	d->set(d, "abc", 1);
	d->set(d, "xyz", 2);
	d->set(d, "lmnop", 3);
	d->set(d, "bazooka joe", 4);

	printf("d[abc] = %i\n", *(d->get(d, "abc")));
	printf("d[xyz] = %i\n", *(d->get(d, "xyz")));
	printf("d[lmnop] = %i\n", *(d->get(d, "lmnop")));
	printf("d[bazooka] = %i\n", *(d->get(d, "bazooka joe")));

	if (d->get(d, "BLT") == NULL) {
		printf("d[BLT] = NULL (as expected)\n");
	}
}
