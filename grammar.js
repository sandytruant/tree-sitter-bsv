module.exports = grammar({
  name: 'bsv',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  conflicts: $ => [
    [$.method_declaration],
    [$.assignment_statement, $.expression],
    [$.assignment_statement, $.bit_select],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.package_declaration,
      $.import_declaration,
      $.module_declaration,
      $.interface_declaration,
      $.typedef_declaration,
      $.function_declaration,
      $.comment,
    ),

    // Comments
    comment: $ => choice(
      seq('//', /.*/),
      seq('(*', /[^*]*\*+(?:[^)*][^*]*\*+)*/, ')'),
      seq('/*', /[^*]*\*+(?:[^/][^*]*\*+)*/, '/'),
    ),

    // Package
    package_declaration: $ => seq(
      'package',
      field('name', $.identifier),
      ';',
      repeat($._definition),
      'endpackage',
      optional(seq(':', $.identifier))
    ),

    // Import
    import_declaration: $ => seq(
      'import',
      $.identifier,
      '::',
      '*',
      ';'
    ),

    // Module
    module_declaration: $ => seq(
      optional('export'),
      'module',
      field('name', $.identifier),
      optional($.parameter_list),
      $.module_body,
      'endmodule',
      optional(seq(':', $.identifier))
    ),

    module_body: $ => seq(
      '(',
      optional($.identifier),
      ')',
      ';',
      repeat(choice(
        $.variable_declaration,
        $.rule_declaration,
        $.method_declaration,
        $.comment,
      ))
    ),

    // Interface
    interface_declaration: $ => seq(
      'interface',
      field('name', $.identifier),
      optional($.parameter_list),
      ';',
      repeat(choice(
        $.method_declaration,
        $.comment,
      )),
      'endinterface',
      optional(seq(':', $.identifier))
    ),

    // Type definitions
    typedef_declaration: $ => seq(
      'typedef',
      choice(
        seq($.type, $.identifier),
        seq('enum', '{', $.identifier_list, '}', $.identifier),
        seq('struct', '{', repeat($.struct_member), '}', $.identifier)
      ),
      ';'
    ),

    struct_member: $ => seq(
      $.type,
      $.identifier,
      ';'
    ),

    // Function
    function_declaration: $ => seq(
      'function',
      $.type,
      field('name', $.identifier),
      $.parameter_list,
      ';',
      repeat(choice(
        $.variable_declaration,
        $.statement,
        $.comment,
      )),
      'endfunction',
      optional(seq(':', $.identifier))
    ),

    // Rules
    rule_declaration: $ => seq(
      'rule',
      field('name', $.identifier),
      optional(seq('(', $.expression, ')')),
      ';',
      repeat(choice(
        $.statement,
        $.comment,
      )),
      'endrule',
      optional(seq(':', $.identifier))
    ),

    // Methods
    method_declaration: $ => choice(
      // Method with body
      seq(
        'method',
        optional($.type),
        field('name', $.identifier),
        optional($.parameter_list),
        ';',
        repeat(choice(
          $.statement,
          $.comment,
        )),
        'endmethod',
        optional(seq(':', $.identifier)),
        ';'
      ),
      // Method without body (interface declaration)
      seq(
        'method',
        optional($.type),
        field('name', $.identifier),
        optional($.parameter_list),
        ';'
      )
    ),

    // Variables
    variable_declaration: $ => seq(
      $.type,
      $.identifier,
      optional(seq('=', $.expression)),
      ';'
    ),

    // Statements
    statement: $ => choice(
      $.assignment_statement,
      $.if_statement,
      $.case_statement,
      $.return_statement,
      $.expression_statement,
    ),

    assignment_statement: $ => seq(
      $.identifier,
      optional(seq('[', $.expression, ']')),
      '<=',
      $.expression,
      ';'
    ),

    if_statement: $ => prec.right(seq(
      'if',
      '(',
      $.expression,
      ')',
      $.statement,
      optional(seq('else', $.statement))
    )),

    case_statement: $ => seq(
      'case',
      '(',
      $.expression,
      ')',
      repeat($.case_item),
      optional(seq('default', ':', $.statement)),
      'endcase'
    ),

    case_item: $ => seq(
      $.expression,
      ':',
      $.statement
    ),

    return_statement: $ => seq(
      'return',
      $.expression,
      ';'
    ),

    expression_statement: $ => seq(
      $.expression,
      ';'
    ),

    // Expressions
    expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.bit_select,
      $.bit_concat,
    ),

    binary_expression: $ => choice(
      prec.left(1, seq($.expression, '||', $.expression)),
      prec.left(2, seq($.expression, '&&', $.expression)),
      prec.left(3, seq($.expression, '|', $.expression)),
      prec.left(4, seq($.expression, '^', $.expression)),
      prec.left(5, seq($.expression, '&', $.expression)),
      prec.left(6, seq($.expression, choice('==', '!='), $.expression)),
      prec.left(7, seq($.expression, choice('<', '<=', '>', '>='), $.expression)),
      prec.left(8, seq($.expression, choice('<<', '>>'), $.expression)),
      prec.left(9, seq($.expression, choice('+', '-'), $.expression)),
      prec.left(10, seq($.expression, choice('*', '/', '%'), $.expression)),
    ),

    unary_expression: $ => prec(11, seq(
      choice('!', '-', '~', '&', '|', '^'),
      $.expression
    )),

    call_expression: $ => seq(
      $.identifier,
      '(',
      optional($.argument_list),
      ')'
    ),

    member_expression: $ => seq(
      $.expression,
      '.',
      $.identifier
    ),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    bit_select: $ => seq(
      $.identifier,
      '[',
      $.expression,
      optional(seq(':', $.expression)),
      ']'
    ),

    bit_concat: $ => seq(
      '{',
      $.expression,
      repeat(seq(',', $.expression)),
      '}'
    ),

    // Types
    type: $ => choice(
      $.parameterized_type,
      $.vector_type,
      $.primitive_type,
      $.identifier,
    ),

    primitive_type: $ => choice(
      'Bit',
      'Int',
      'UInt',
      'Bool',
      'void',
      'Integer',
      'String',
      'Reg',
      'Wire',
      'FIFO',
      'Action',
      'ActionValue',
      'Rules',
      'Module',
    ),

    parameterized_type: $ => seq(
      choice($.identifier, $.primitive_type),
      '#',
      '(',
      choice($.type, $.number, $.expression),
      repeat(seq(',', choice($.type, $.number, $.expression))),
      ')'
    ),

    vector_type: $ => seq(
      'Vector',
      '#',
      '(',
      $.expression,
      ',',
      $.type,
      ')'
    ),

    // Parameters and arguments
    parameter_list: $ => seq(
      '(',
      optional(seq(
        $.parameter,
        repeat(seq(',', $.parameter))
      )),
      ')'
    ),

    parameter: $ => seq(
      $.type,
      $.identifier
    ),

    argument_list: $ => seq(
      $.expression,
      repeat(seq(',', $.expression))
    ),

    identifier_list: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier))
    ),

    // Literals
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: $ => choice(
      /[0-9]+/,
      /[0-9]+\.[0-9]+/,
      /[0-9]+'[bBoOdDhH][0-9a-fA-F_]+/,
    ),

    string: $ => seq('"', /[^"]*/, '"'),

    boolean: $ => choice('True', 'False'),
  }
});
