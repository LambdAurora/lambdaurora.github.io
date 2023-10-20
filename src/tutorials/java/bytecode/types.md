# JVM Bytecode: Types

<!--description:Introduction to how types are represented in the Java Virtual Machine bytecode.-->

The Java Virtual Machine bytecode is a very interesting piece of technology,
it's what Java is compiled to and knowing about it can lead to having an interesting view of Java itself.

Here we will talk about how the types are described in bytecode, which can help understand
some structures that are directly influenced by how the bytecode works,
and may be of help for any Java software modder as bytecode injection will most likely require you to know
about bytecode.

## Base Types

### Primitives

Primitive types are types that represent very simple types like booleans, numbers...
We have the following types:

- `V`, represents `void`, it exists as a type descriptor for method return types.
- `Z`, represents a `boolean` type.
- `B`, represents a `byte` type.
- `C`, represents a `char` type.
- `S`, represents a `short` type.
- `I`, represents an `int` type.
- `J`, represents a `long` type.
- `F`, represents a `float` type.
- `D`, represents a `double` type.

### Objects

Objects are described with the `L` prefix, then followed with the bytecode class name and ends with the `;` character.
The bytecode class name format is the whole package and class name, separated with slashes instead of dots.
In the case of sub classes, the separator is a dollar.

For example, for a type describing `Object`: `Ljava/lang/Object;`,
or for `java.io.ObjectInputFilter.Status`: `Ljava/io/ObjectInputFilter$Status;`.

### Arrays

Arrays are described using an open bracket (`[`) as a prefix, then the element type of the array.

For example:
 - `int[]` becomes `[I`
 - `Object[]` becomes `[Ljava/lang/Object;`
 - `String[]` becomes `[Ljava/lang/String;`
 - `boolean[][]` becomes `[[Z`

## Fields

Field descriptors are described very simply just by using the base type.

## Methods

Method type descriptors require a little more work,
they start with the parameters encapsulated between parenthesis then end with the return type.

For example the type descriptor of a method that takes an `int` and returns nothing would be `(I)V`,
the type descriptor of a `main` method would be `([Ljava/lang/String;)V`.
If we have a method written as `float something(int a, int b, String c)` then we would have `(IILjava/lang/String;)F`.

## Notes

One thing you might notice is I haven't talked about generic types,
the reason for it is generic types do not exist for type descriptors,
they are simplified to the object type the generic require all types to be.

For a more formal description of those types, I invite you to read
the [JVM specification (section about descriptors)](https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-4.html#jvms-4.3).
