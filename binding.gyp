{
  "targets": [
    {
      "target_name": "tree_sitter_bsv_binding",
      "include_dirs": [
        "<!(node -e \"require('node-addon-api').include\")",
        "src"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c",
        "src/scanner.c"
      ],
      "cflags_c": [
        "-std=c99"
      ]
    }
  ]
}
