# lezer-elixir

Elixir grammar for the [Lezer](https://lezer.codemirror.net) parser system.

## Design

This grammar is based directly on [tree-sitter-elixir](https://github.com/elixir-lang/tree-sitter-elixir)
and closely mirrors its syntax tree and decisions. All the test cases are adapted from there
as well. Refer to the corresponding repository for further documentation.

### Differences

The Elixir syntax tree is very generic. Most of the language built-ins, such as a function
definition, are no different than user-defined functions. It is only for the purpose
of highlighting, where it makes sense to distinguish certain keywords.

tree-sitter allows pattern matching on arbitrary fragments of the syntax tree, which is
flexible enough to correctly tag nodes for highlighting in all cases. On the other hand,
in Lezer the highlighting queries are more strict, for performance reasons. Under these
restrictions, we need a more specialized syntax tree that, for example, uses separate
nodes for function definition call and regular function call. Additionally, Lezer does
not support annotating nodes with "fields", for example, to distinguish between operator
left and right expression. In cases where we need those, an explicit nodes are required.

Given that, this grammar describes a syntax tree that is a superset of the tree-sitter
one. The following additional nodes are present:

- `Identifier` specializations

  - `SpecialIdentifier` (`__MODULE__`)
  - `UnderscoredIdentifier` (`_x`)

- `Call` specializations

  - `FunctionDefinitionCall` (`def fun(x), do: 1`)
  - `KernelCall` (`if`) - in addition to `Call`

- `UnaryOperator` specializations

  - `AtOperator` (`@x`)
  - `DocOperator` (`@doc "..."`)
  - `CaptureOperator` (`&fun/1`)
  - `CaptureOperand` (`&1`)

- `BinaryOperator` specializations

  - `WhenOperator` (`left when right`)
  - `PipeOperator` (`left |> right`)

- `Sigil` specializations

  - `StringSigil` (`~s"string"`, `~S"string"`)

- named operator groups

  - `Operator` (`+`)
  - `WordOperator` (`and`)

- explicitly included tokens

  - `do`, `end`, `fn`, `after`, `else`, `catch`, `rescue`
  - all brackets

- fields:
  - `Right` node in `WhenOperator`, `PipeOperator` and `Dot` to distinguish the left and
    right operand (note that this is enough to make the distinction, we don't need `Left`,
    which would result in more conflicts when introduced)
  - we do not need an explicit "target" node for calls, because arguments are already
    separated under the `Arguments` node, hence anything else on that level is the target

## License

    Copyright (C) 2024 Dashbit

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
