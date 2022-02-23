# C - Pointers and their arithmetic

<!--description:Learn about C pointers and their arithmetic.-->

Currently, computers have multiple kind of memories: RAM, CPU caches, HDDs, SSDs, etc.

For a programmer, most of those memories can be seen as a contiguous array, where each element of the array represents a byte.
A memory address can be seen as an index to one of those bytes.
In reality it's a little bit more complex since a kernel, and other computer parts, will treat those slightly differently,
either for optimization, or for abstraction.

[The C programming language][C] is a low-level language which has a concept of "pointers".
As the name suggests, a pointer points. It points to a memory address in RAM.

[[ToC]]

## What are pointers useful for? What do they point to exactly?

[C] pointers allow to point to a place in memory, which allows you to pass data without copying its content.
This is very useful for mutable data, avoiding copies, passing functions, and more.

They can point to anything, any kind of addresses. Those addresses may be the addresses of functions, any data, etc.
Though, accessing the content that is pointed by some pointers may be disallowed. Programs are allocated a memory space,
they are only allowed to access to addresses in this space.

## A quick word about memory

Every programs can allocate memory, but there's two kinds of memory space: the stack and the heap.

The stack is a memory space where stuff can be pushed, then popped, we can visualize this with scopes.
Let's take an example:

```c
{	// We start a scope.
	int a; // We push a on the stack.

	{	// The stack state is "marked" in this new scope.
		int b; // We push b on the stack.
	}	// We exit the scope, we pop the stack to its latest state, a remain but b is popped.
}	// We exit the outer scope, a is popped.
```

The heap is more dynamic, you can request a chunk of memory off of it at runtime.
To do so we call the function `malloc`, this chunk of memory will live until it is freed with the function `free`.
`malloc` takes as argument the size in bytes to allocate, and returns a pointer to the allocated memory.

This call can fail if the memory is already filled and you request too much memory, which can happen if too many programs are opened at once,
or if a memory leak is occuring.

Remember to `free` heap-allocated memory as soon as you do not need it anymore.
Heap memory is also much slower to allocate than the stack due to it being [a system call](https://en.wikipedia.org/wiki/System_call "System call").

## How to use a pointer in C?

Now that we know what is a pointer, let's see how we can use them.

First of all, a [C] pointer is recognizable as there's the character `*` next to a type.
`int` is an integer type, `int*` is a pointer pointing to an integer,
`void*` is a pointer pointing to an unknown type of data, etc.

[C] has multiple operators to manipulate pointers:
 - `&` to get the address of a variable as a pointer;
 - `*` to access the content pointed by a pointer, this operation is called dereferencing.

Now, let's see how those are used:
```c
int main(int argc, char** argv) {
	int a = 42;
	int* pointer_of_a; // We declare a pointer to an integer.
	pointer_of_a = &a; // We assign the pointer so it points to a.

	printf("%d\n", *pointer_of_a); // Will print 42, as we accessed the content pointed by pointer_of_a.

	return 0;
}
```

In this program, we could see a simplified view of the memory:

| Index | Name           | Type in [C] | Content |
|:-----:|:--------------:|:-----------:|:-------:|
| `1`   | `argc`         | `int`       | ?       |
| `2`   | `argv`         | `char**`    | ?       |
| `3`   | `a`            | `int`       | `42`    |
| `4`   | `pointer_of_a` | `int*`      | Index 3 |

Hopefully, this helps to visualize.

*Uh, didn't you said that a pointer points to a memory address, which represents a byte?
But the size of an `int` isn't a single byte!*

Indeed, it isn't a single byte, in those cases the pointer will point to the beginning of the memory space occupied.
Since the type of the pointer is `int*` we tell the [C] compiler that we point to a memory address whose content occupies the size in bytes of `int`.

*Can a function return a pointer? Take one as parameter?*

Yes! Well, for the case of a return it's slightly more complex, if it's a stack pointer (one you always get using `&`), no.
The thing is if you return a stack pointer from the scope of the function, since the scope ends, it is popped.
Which means the address pointed to is free again, this means it can be overwritten by other stack operations without your control.

*Wait, why does the type of argv is `char**`, isn't that a pointer?*

Yes! It is a pointer to a pointer of a character.  
Let's see what it exactly means.

## Pointers, structure, and C arrays

A [C] array is a type that can hold multiple elements of a type.
For example the variable `int a[5]` means we have an array of ints whose length is 5.

An array is also a memory space, which means we can consider the type to be equivalent to some degree to a pointer.
But it is still different, but you can convert this array notation to a regular pointer.

This leads us to talk about how to access the content of an array, with an example:

```c
int main(int argc, char** argv) {
	int a[5] = { 1, 2, 3, 42, 6 }; // We create an array with 5 elements.
	// In this case we could get rid of the 5 in the brackets as we already have a definition of the elements.
	int* as_pointer = a; // The array as a pointer.

	printf("First element: %d\n", a[0]); // We access the first element of the array, arrays are 0-indexed! Prints 1.
	printf("Pointer content: %d\n", *as_pointer); // Prints 1. The pointer points to the first element of the array!
	// And remember what we said previously, the pointer is int*, so it tells to the compiler that the content pointed is an integer.

	printf("Fourth element: %d\n", a[3]); // Prints 42.
	printf("Fourth element, with pointer: %d\n", as_pointer[3]); // Prints 42!
	// As you can see, we can use the same notation to access elements with pointers!

	// Now, let's get a little fancy, what if we said to the pointer that the first element is the fourth?
	int fourth = *(as_pointer + 3); // Holds 42!
	// So, what happened is first we added 3, which changes the address pointed, which corresponds to the fourth element.
	// Then we access to its content!

	return 0;
}
```

Ok, now we know how to access elements of an array, and what the relation is between pointers and arrays.
This means we can quickly come back to `char** argv`.

In [C][C], strings are arrays of characters: `char*`, they are null-terminated (the last element is the character `\0`).
In the case of `char** argv` this means we have an array of strings, or an array of array of characters.

Now, in the case of structures it's very similar, but [C] offers syntax sugar to replace the `*` operator and the `.` operator to access to a structure element:

```c
struct a {
	int some_number;
};

int main(int argc, char** argv) {
	struct a a_struct; // The structure a.
	a_struct.some_number = 42;

	struct a* ptr_of_a = *a_struct; // We get the pointer of the structure.
	printf("%d\n", ptr_of_a->some_number); // Prints 42.

	return 0;
}
```

As you can see, the `->` operator allows us to combine the `*` operator on a pointer with the `.` operator of structure elements,
which allows to have a more readable code.

A pointer to a structure is also a pointer to its first element, the same as arrays.

Ok, what about the fancy notation on the array now, what does *that* mean? *Why is there an addition?*

## Pointer arithmetic

Pointers points to a memory address, we can say the *value* of a pointer is a number, which represents that memory address.

This means:
 - we can have a null pointer: `NULL` or `0`, it represents a space of memory that is inaccessible,
   can be used to represent an invalid return value to tell something bad happened;
 - we can apply mathematical operators to it!

If pointers were already mind-bending for you, then this part will be even more.

Let's come back to this quote:

> Indeed, it isn't a single byte, in those cases the pointer will point to the beginning of the memory space occupied.
> Since the type of the pointer is `int*` we tell the [C] compiler that we point to a memory address whose content occupies the size in bytes of `int`.

So, `int` is usually 4 bytes, `char` is usually 1 byte.
And a memory address represents exactly 1 byte.  
A pointer to `int` is a pointer to the first byte.

So, why is all of this important?

All of this information is only indications for the compiler, and the programmer, otherwise for the computer itself it's useless.
It tells to the compiler how do you want to use the pointers, what kind of data you want to manipulate with it.

This is important for the `[<number>]` notation or mathematical operations, because it redefines the unit you operate on.
If pointers only supported one byte types,
this would mean if you want to print `*a` (`a` of type `int*`), it will only print the content of the first byte.
And that means if you did `a[1]` it would be the second byte of the first element, and not the second element.

When you manipulate a `int*` pointer, you manipulate in the unit of the size of `int`.
I believe this was done since some of the types do not always have the same size depending on the host computer,
and it was tedious for programmers to only operate on an unit of single bytes.
This is very important to remember of pointer arithmetics.

It is also important to note that `void*` pointers do not have a set size, which means you cannot do arithmetics on them since they lack units.

Now, this means we can:
 - add to a pointer an offset;
 - subtract an offset;
 - multiply pointers;
 - divide pointers;
 - etc.

In reality, only the first two are actually used.

Now, let's take structures and see why this is useful,
let's define three structures, and have 2 be used as array element, the first one would hold the length data.

Then we define a memory space that holds the header, 5 elements of the first array and 10 elements of the second.

```c
struct header {
	size_t len_of_a;
	size_t len_of_b;
	int d;
	int c;
};

struct a {
	int some_number;
};

struct b {
	int some_other_number;
};

int main(int argc, char** argv) {
	// We allocate a memory space, which holds the header structure, 
	// 5 elements of the structure a, and 10 elements of the structure b.
	struct header* header = (struct header*) malloc(
		sizeof(struct header)
		+ 5 * sizeof(struct a)
		+ 10 * sizeof(struct b)
	);

	header->len_of_a = 5;
	header->len_of_b = 10;
	header->d = 20;
	header->c = 2;

	// Now we want to access to the array of struct a:
	struct a* a_arr = (struct a*) (header + 1); // We offset right after the header,
	// we have our first element.

	for (int i = 0; i < header->len_of_a; i++) {
		a_arr[i].some_number = i; // We set the some_number field on each element with the index.
	}

	// Now we want to acess to the array of struct b:
	struct b* b_arr = (struct b*) (a_arr + header->len_of_a);
	// So, what we did is we took the first array, and we offset right after it.
	// This means that in bytes we are at:
	// sizeof(struct header) + header->len_of_a * sizeof(struct a)!

	for (int i = 0; i < header->len_of_b; i++) {
		b_arr[i].some_other_number = i * 10;
	}

	free(header); // This frees the memory space we allocated earlier, including the arrays.

	return 0;
}
```

I hope you start to understand how pointer arithmetic works now.

In reality we most likely wouldn't use `malloc` like this and do three separate calls instead.
There might be situations where doing only one call might be better, but this is not the subject of this tutorial.
The place where you're most likely to see something similar is with [memory mapping](https://en.wikipedia.org/wiki/Mmap):
we take a file and map it into memory, the program can access its content as if it was in RAM.

## Function pointers

As we have seen, pointers point to a place in memory. Memory can store either data, or executable instructions.
This means we can point to executable instructions, and in this case it's functions.

The use case of function pointers can be to pass a callback function,
for example if you want to pass a function to call when a keypress, mouse movement, custom message logging, etc.

### How to use function pointers?

First of all, let's talk about the type. Yes, there's a type for function pointers.

The type of a function pointer is composed of multiple parts:
 - the return type of the function;
 - in parenthesis, the `*` symbol followed by the name of the function pointer
   (can be the parameter name, or the variable name);
 - the argument types of the function in parenthesis, separated by commas.

For a function that takes an `int` and doesn't return anything, the pointer named `fn_ptr` would be written as `void (*fn_ptr)(int)`.

Some function pointer types may quickly become very difficult to read,
in that case there is [cdecl](https://cdecl.org/) which translates between [C] syntax and English.

Now that we know how to write the type of a function pointer, let's use them!

For our first example, let's take a function that simply consumes an integer, get a pointer to it,
then call it with the pointer:

```c
void consume(int a) {
	printf("Value of a is %d\n", a);
}

int main(int argc, char** argv) {
	void (*fn_ptr)(int); // We declare a function pointer named fn_ptr.
	fn_ptr = consume; // We make it point to the function consume.

	fn_ptr(42); // We call the function pointed by fn_ptr.

	// At the end of the execution of this program, "Value of a is 42" has been printed.

	return 0;
}
```

As you can see, for assignment we can just use the name of the function to point to it,
if you want the `&` is still valid though.
And for calling the function, we can just use the pointer as if it was a function,
the dereferencing operator `*` is also still valid, which would give us `(*fn_ptr)(42)` instead.

For those familiar with lambda functions, I'm sorry to inform you that [C] doesn't have a feature for that.
You will have to create a separate function to point to.

Now let's see another quick example of what function pointers can do:
let say we have a quick sort function [`qsort`](http://www.cplusplus.com/reference/cstdlib/qsort/) to sort arrays,
and we want a single implementation for any data type we can think of.
As you probably have seen with the external link on `qsort`, the [C] standard library has a function for that!  
Let's use it:

```c
#include <stdlib.h>

// Sample comparator function that is used for
// sorting an integer array in ascending order.
// The function pointer that qsort takes is
// int (*compare)(const void*, const void*)
// const means you are disallowed to change the value pointed by the pointer.
// void because the sort function itself isn't aware of the type of the array to sort.
int compare(const void* a, const void* b) {
	return *((int*) a) - *((int*) b);
}

int main(int argc, char** argv) {
	int arr[] = { 12, 6, 24, 96, 256, 128 }; // We declare an array to sort.
	int n = sizeof(arr) / sizeof(arr[0]); // We can do that since we are in the same scope.

	qsort(arr, n, sizeof(int), compare); // We sort the integer array using compare.

	// We print the sorted array.
	for (int i = 0; i < n; i++) {
		printf("%d ", arr[i]);
	}
	printf("\n");

	return 0;
}
```

The output should be `6 12 24 96 128 256`.

Now you know how to declare function pointers, how to use them, and their use case!

### Function pointers array

Now, let's have a quick word on how to make an array of function pointers.

Say we have a function descriptor that returns nothing, and takes two integers,
the type of the function pointer would be `void (*fn_ptr_name)(int, int)`.

Now we want an array out of it, as we have seen previously an array is defined by `type name[length]`,
if we have an array of three function pointers we would then have: `void (*fn_ptr_name[3])(int, int)`.

Let's use it:

```c
void add(int a, int b) {
	printf("%d + %d = %d\n", a, b, a + b);
}

void subtract(int a, int b) {
	printf("%d - %d = %d\n", a, b, a - b);
}

void multiply(int a, int b) {
	printf("%d * %d = %d\n", a, b, a * b);
}

int main(int argc, char** argv) {
	// We create an array of the function pointers of operations:
	void (*operations[])(int, int) = { add, subtract, multiply };

	int a = 4, b = 6;

	// We will call every operations on a and b from the array.
	for (int i = 0; i < 3; i++) {
		(*operations[i])(a, b);
	}

	return 0;
}
```

The output will be:
```
4 + 6 = 10
4 - 6 = -2
4 * 6 = 24
```

This concludes my talk about function pointers.

## Structure alignment

When working with pointers and structure, structure alignment may be a really important thing to consider.

Here's a quick definition:

> The CPU in modern computer hardware performs reads and writes to memory most efficiently when the data is *naturally aligned*,
> which generally means that the data's memory address is a multiple of the data size.
> For instance, in a 32-bit architecture, the data may be aligned if the data is stored in four consecutive bytes
> and the first byte lies on a 4-byte boundary.
> <div class="ls_source">
> [Wikipedia](https://en.wikipedia.org/wiki/Data_structure_alignment "Data structure alignment")
> </div>

This means that whatever you put in structures, it could be misaligned.
Lucky for us, the compiler saves us and creates padding to re-align structures.
This means on a 32-bit computer, if we have a structure a like:

```c
struct a {
	char a;
	int b;
	short c;
	int d;
	int e;
	char f;
};
```

the compiler will create this padding:

```c
struct a {
	char a;
	char padding1[3];
	int b;
	short c;
	char padding2[2];
	int d;
	int e;
	char f;
	char padding3[3];
};
```

Now our structure is aligned in an invisible way for the programmer.

This is important to consider as it means: `2 * sizeof(char) + 3 * sizeof(int) + sizeof(short) != sizeof(struct a)`!
It's also very important to consider with pointers, as the pointer to a structure is also the pointer to its first element.

There's also a way to tell the compiler to pack the structure to avoid padding, but it's not something to apply in every cases.
You can reduce paddings by grouping fields by type, from the largest to the smallest.

## Conclusion

I hope this tutorial has been helpful for you, and that you now understand better pointers and their arithmetics.

I have been inspired to write this tutorial as I have noticed *a lot of people* have a hard time to understand [C] pointers,
despite attending lectures or reading about them.
My goal is that hopefully this article achieves its goal of transmitting knowledge.

Do not hesitate to experiment! Try! Be aware of segfaults (segmentation faults, access to forbidden parts of the memory)!
And continue to learn. 

[C]: https://en.wikipedia.org/wiki/C_(programming_language) "C Programming Language"
