import { styleTags, tags as t } from "@lezer/highlight";

export const elixirHighlighting = styleTags({
  "Atom QuotedAtom QuotedAtom/QuotedContent Keyword QuotedKeyword QuotedKeyword/QuotedContent":
    t.atom,
  Alias: t.namespace,
  Boolean: t.bool,
  Nil: t.null,
  Integer: t.integer,
  Float: t.float,
  Identifier: t.variableName,
  Comment: t.lineComment,
  SpecialIdentifier: t.special(t.variableName),
  UnderscoredIdentifier: t.comment,
  "String String/QuotedContent": t.string,
  "Charlist Charlist/QuotedContent": t.string,
  "Sigil Sigil/SigilName Sigil/QuotedContent Sigil/{ Sigil/} Sigil/[ Sigil/] Sigil/( Sigil/)":
    t.special(t.string),
  EscapeSequence: t.escape,
  "Interpolation/#{ Interpolation/}": t.special(t.brace),
  "( )": t.paren,
  "[ ]": t.squareBracket,
  "% { }": t.brace,
  ", ;": t.separator,
  "<< >>": t.angleBracket,
  // Explicit keywords
  "fn do end catch rescue after else": t.keyword,
  // Operators
  Operator: t.operator,
  WordOperator: t.keyword,
  "CaptureOperand/Integer": t.operator,
  // Module attribute
  "AtOperator/Operator AtOperator/Identifier AtOperator/Boolean AtOperator/Nil AtOperator/Call/Identifier":
    t.attributeName,
  // Doc string (we don't use ! so that interpolation is not overridden)
  "DocAtOperator/Operator DocAtOperator/Identifier DocAtOperator/Call/Identifier DocAtOperator/Call/Arguments/Boolean DocAtOperator/Call/Arguments/String DocAtOperator/Call/Arguments/String/QuotedContent DocAtOperator/Call/Arguments/Charlist DocAtOperator/Call/Arguments/Charlist/QuotedContent DocAtOperator/Call/Arguments/Sigil DocAtOperator/Call/Arguments/Sigil/QuotedContent DocAtOperator/Call/Arguments/Sigil/SigilName DocAtOperator/Call/Arguments/Sigil/{ DocAtOperator/Call/Arguments/Sigil/} DocAtOperator/Call/Arguments/Sigil/[ DocAtOperator/Call/Arguments/Sigil/] DocAtOperator/Call/Arguments/Sigil/( DocAtOperator/Call/Arguments/Sigil/)":
    t.docString,
  // Function calls
  "Call/Identifier Call/UnderscoredIdentifier": t.function(t.variableName),
  "Call/Dot/Right/Identifier Call/Dot/Right/SpecialIdentifier Call/Dot/Right/UnderscoredIdentifier":
    t.function(t.variableName),
  "Call/Dot/Atom": t.namespace,
  // Pipe into identifier
  "PipeOperator/Right/Identifier": t.function(t.variableName),
  // Function definitions
  "FunctionDefinitionCall/Identifier": t.keyword,
  "FunctionDefinitionCall/Arguments/Identifier FunctionDefinitionCall/Arguments/UnderscoredIdentifier FunctionDefinitionCall/Arguments/SpecialIdentifier":
    t.definition(t.function(t.variableName)),
  "FunctionDefinitionCall/Arguments/Call/Identifier FunctionDefinitionCall/Arguments/Call/UnderscoredIdentifier FunctionDefinitionCall/Arguments/Call/SpecialIdentifier":
    t.definition(t.function(t.variableName)),
  "FunctionDefinitionCall/Arguments/WhenOperator/Identifier FunctionDefinitionCall/Arguments/WhenOperator/UnderscoredIdentifier FunctionDefinitionCall/Arguments/WhenOperator/SpecialIdentifier":
    t.definition(t.function(t.variableName)),
  "FunctionDefinitionCall/Arguments/WhenOperator/Call/Identifier FunctionDefinitionCall/Arguments/WhenOperator/Call/UnderscoredIdentifier FunctionDefinitionCall/Arguments/WhenOperator/Call/SpecialIdentifier":
    t.definition(t.function(t.variableName)),
  "FunctionDefinitionCall/Arguments/PipeOperator/Right/Identifier":
    t.variableName,
  // Kernel built-in
  "KernelCall/Identifier": t.keyword,
});
