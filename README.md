# tree-sitter-bsv

Bluespec SystemVerilog (BSV) grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

## Features

This grammar provides basic syntax highlighting support for Bluespec SystemVerilog, including:

- Package declarations
- Import statements
- Module definitions
- Interface definitions
- Function declarations
- Type definitions (typedef, struct, enum)
- Rules and methods
- Statements (if, case, assignment, etc.)
- Expressions
- Comments (single-line, multi-line)

## Installation

### npm

```bash
npm install tree-sitter-bsv
```

## Usage

### Node.js

```javascript
const Parser = require('tree-sitter');
const BSV = require('tree-sitter-bsv');

const parser = new Parser();
parser.setLanguage(BSV);

const sourceCode = `
package Example;
  module mkCounter (Counter);
    Reg#(Int#(32)) count <- mkReg(0);
  endmodule
endpackage
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Tree-sitter CLI

```bash
tree-sitter generate
tree-sitter test
```

## Development

### Prerequisites

- Node.js >= 12
- npm
- tree-sitter-cli

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

## Supported Syntax

### Basic Structure

- `package ... endpackage`
- `import Module::*`
- `module ... endmodule`
- `interface ... endinterface`

### Type System

- Primitive types: `Bit`, `Int`, `UInt`, `Bool`, `Integer`, `String`
- Special types: `Reg`, `FIFO`, `Action`, `ActionValue`, `Module`
- Parameterized types: `Reg#(Int#(32))`
- Vector types: `Vector#(n, Type)`

### Declarations

- Variables: `Type name = value;`
- Functions: `function Type name(params); ... endfunction`
- Typedefs: `typedef Type NewType;`
- Structs: `typedef struct { fields... } Name;`

### Statements

- Assignment: `var <= expr;`
- If-else: `if (cond) stmt else stmt`
- Case: `case (expr) ... endcase`
- Return: `return expr;`

## Example

See `examples/counter.bsv` for a complete example.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
