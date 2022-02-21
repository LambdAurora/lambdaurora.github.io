# C - Pointer Arithmetic

Currently, computers have multiple kind of memories: RAM, CPU caches, HDDs, SSDs, etc.

Most of those memories can be seen as a contiguous array, where each element of the array represents a byte.
A memory address can be seen as an index to one of those bytes.
In reality it's a little bit more complex since a kernel, and other computer parts, will treat those slightly differently,
either for optimization, or for abstraction.

[The C programming language][C] is a low-level language which has a concept of "pointers".
As the name suggests, a pointer points. It points to a memory address in RAM.

[[ToC]]

## What are pointers useful for? What do they point exactly?

[C] pointers allow to point of a place in memory, which allows you to data without copying the content.
This is very useful for mutable data, avoiding copies, passing functions, and more.

They can point to anything, any kind of addresses. Those addresses may be the addresses of functions, any data, etc.
Though, accessing the content that is pointed by some pointers may be disallowed. Programs are allocated a memory space,
they are only allowed to access to addresses in this space.

## How to use a pointer in [C]?

Now that we know what is a pointer, let's see how we can use them.

First of all, a [C] pointer is recognizable as there's the character `*` next to a type.
`int` is an integer type, `int*` is a pointer pointing to an integer,
`void*` is a pointer pointing to an unknown type of data, etc.

[C] has multiple operators to manipulate pointers:
 - `&` to get the pointer of a variable;
 - `*` to access the content pointed by a pointer.

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

*Wait, why does the type of argv is `char**`, isn't that a pointer?

Yes! It is a pointer to a pointer of a character.  
Let's see what it exactly means.

## Pointers and [C] arrays

A [C] array is a type that can hold multiple elements of a type.
For example the variable `int a[5]` means we have an array of ints whose length is 5.

An array is also a memory space, which means we can consider the type to be equivalent to some degree to a pointer.
But it is still different, but you can convert this array notation to a regular pointer.

This leads us to talk about how to access the content of an array, with an example:

```c
int main(int argc, char** argv) {
    int a[5] = { 1, 2, 3, 42, 6 }; // We create an array with 5 elements.
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

Ok, now we know how to access elements of an array, and what's the relation between pointers and arrays.
This means we can quickly come back to `char** argv`.

In [C], strings are arrays of characters: `char*`, they are null-terminated (the last element is the character `\0`).
In the case of `char** argv` this means we have an array of strings, or an array of array of characters.

Ok, what about the fancy notation now, what does *that* mean?

## Pointer arithmetic

Pointers points to a memory address, we can say the *value* of a pointer is a number, which represents that memory address.

This means:
 - we can have a null pointer: `NULL` or `0`, it represents a space of memory that is inaccessible;
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

This is important for the `[<number>]` notation or mathematical operations, because it redefines the unit you operator on.
If pointers only supported one byte types,
this mean if you want to print `*a` (`a` of type `int*`), it would only print the content of the first byte.
And this means if you did `a[1]` it would be the second byte of the first element, and not the second element.

When you manipulate a `int*` pointer, you manipulate in the unit of the size of `int`.
I believe this was done since some of the types do not always have the same size depending on the host computer,
and it was tedious for programmers to only operate on an unit of single bytes.
This is very important to remember of pointer arithmetics.

Now, this means we can:
 - add to a pointer an offset;
 - subtract an offset;
 - multiply pointers;
 - divide pointers;
 - etc.

In reality, only the first three are actually used.

Now, let's take structures and see why this is useful:

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
    return 0;
}
```

[C]: https://en.wikipedia.org/wiki/C_(programming_language) "C Programming Language"
