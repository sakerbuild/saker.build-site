# Force inclusion

Force inclusion of a file instructs the compiler to prepend the compilation unit with the contents of a given file. It is basically saying that an `#include "foo.h"` should be added at the top of the source file. This can be advantageous if you want to include some code in all the compiled source files without modifying them individually.

Let's see an example:

```cpp
// foo.h
#define FOO_CONSTANT 123
```

```cpp
// main.cpp
#include "foo.h"

int main() {
	return FOO_CONSTANT;
}
```

The above doesn't use force inclusion, and compiles fine as is. However, if we modify `main.cpp` by removing the inclusion:

```cpp
// foo.h
#define FOO_CONSTANT 123
```

```cpp
// main.cpp
int main() {
	return FOO_CONSTANT;
}
```

And use the [`ForceInclude`](/taskdoc/types/CompilationInputPassTaskOption.html#f-ForceInclude) parameter to add the `foo.h` to the compilation unit:

```sakerscript
saker.clang.compile({
	Files: *.cpp,
	ForceInclude: foo.h,
})
```

Then the code will compile just as fine. The task uses the `-include` clang parameter when invoking clang.

(Note that you can specify multiple files to be force included, they will be added in the order they are specified for the parameter.)
