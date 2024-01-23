import { ExternalTokenizer } from "@lezer/lr";

import {
  identifier,
  underscoredIdentifier,
  SigilModifiers,
  atomWord,
  beforeUnaryOp,
  doubleSlash,
  docAt,
  immediateColonWhitespace,
  immediateParenOpen,
  immediateSquareOpen,
  keywordWord,
  newlineBeforeBinaryOperator,
  newlineBeforeDo,
  newlineTerminator,
  notIn,
  quotedContentAngle,
  quotedContentBar,
  quotedContentCurly,
  quotedContentDouble,
  quotedContentHeredocDouble,
  quotedContentHeredocSingle,
  quotedContentIAngle,
  quotedContentIBar,
  quotedContentICurly,
  quotedContentIDouble,
  quotedContentIHeredocDouble,
  quotedContentIHeredocSingle,
  quotedContentIParenthesis,
  quotedContentISingle,
  quotedContentISlash,
  quotedContentISquare,
  quotedContentParenthesis,
  quotedContentSingle,
  quotedContentSlash,
  quotedContentSquare,
} from "./parser.terms.js";

const CP_TAB = 9,
  CP_NEWLINE = 10,
  CP_CR = 13,
  CP_SPACE = 32,
  CP_EXCLAMATION_MARK = 33,
  CP_DOUBLE_QUOTE = 34,
  CP_HASH = 35,
  CP_PERCENT = 37,
  CP_AMPERSAND = 38,
  CP_SINGLE_QUOTE = 39,
  CP_PAREN_OPEN = 40,
  CP_PAREN_CLOSE = 41,
  CP_STAR = 42,
  CP_PLUS = 43,
  CP_COMMA = 44,
  CP_MINUS = 45,
  CP_DOT = 46,
  CP_SLASH = 47,
  CP_ZERO = 48,
  CP_NINE = 57,
  CP_COLON = 58,
  CP_SEMICOLON = 59,
  CP_ANGLE_OPEN = 60,
  CP_EQUALS = 61,
  CP_ANGLE_CLOSE = 62,
  CP_QUESTION_MARK = 63,
  CP_AT = 64,
  CP_A_UPPER = 65,
  CP_Z_UPPER = 90,
  CP_SQUARE_OPEN = 91,
  CP_BACKSLASH = 92,
  CP_SQUARE_CLOSE = 93,
  CP_CARET = 94,
  CP_A_LOWER = 97,
  CP_C_LOWER = 99,
  CP_D_LOWER = 100,
  CP_E_LOWER = 101,
  CP_H_LOWER = 104,
  CP_I_LOWER = 105,
  CP_L_LOWER = 108,
  CP_M_LOWER = 109,
  CP_N_LOWER = 110,
  CP_O_LOWER = 111,
  CP_P_LOWER = 112,
  CP_R_LOWER = 114,
  CP_T_LOWER = 116,
  CP_U_LOWER = 117,
  CP_W_LOWER = 119,
  CP_Y_LOWER = 121,
  CP_Z_LOWER = 122,
  CP_CURLY_OPEN = 123,
  CP_BAR = 124,
  CP_CURLY_CLOSE = 125,
  CP_TILDE = 126;

const QUOTED_CONTENT_INFOS = [
  {
    token: quotedContentISingle,
    supportsInterpol: true,
    endDelimiter: CP_SINGLE_QUOTE,
    delimiterLength: 1,
  },
  {
    token: quotedContentIDouble,
    supportsInterpol: true,
    endDelimiter: CP_DOUBLE_QUOTE,
    delimiterLength: 1,
  },
  {
    token: quotedContentIHeredocSingle,
    supportsInterpol: true,
    endDelimiter: CP_SINGLE_QUOTE,
    delimiterLength: 3,
  },
  {
    token: quotedContentIHeredocDouble,
    supportsInterpol: true,
    endDelimiter: CP_DOUBLE_QUOTE,
    delimiterLength: 3,
  },
  {
    token: quotedContentIParenthesis,
    supportsInterpol: true,
    endDelimiter: CP_PAREN_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentICurly,
    supportsInterpol: true,
    endDelimiter: CP_CURLY_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentISquare,
    supportsInterpol: true,
    endDelimiter: CP_SQUARE_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentIAngle,
    supportsInterpol: true,
    endDelimiter: CP_ANGLE_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentIBar,
    supportsInterpol: true,
    endDelimiter: CP_BAR,
    delimiterLength: 1,
  },
  {
    token: quotedContentISlash,
    supportsInterpol: true,
    endDelimiter: CP_SLASH,
    delimiterLength: 1,
  },
  {
    token: quotedContentSingle,
    supportsInterpol: false,
    endDelimiter: CP_SINGLE_QUOTE,
    delimiterLength: 1,
  },
  {
    token: quotedContentDouble,
    supportsInterpol: false,
    endDelimiter: CP_DOUBLE_QUOTE,
    delimiterLength: 1,
  },
  {
    token: quotedContentHeredocSingle,
    supportsInterpol: false,
    endDelimiter: CP_SINGLE_QUOTE,
    delimiterLength: 3,
  },
  {
    token: quotedContentHeredocDouble,
    supportsInterpol: false,
    endDelimiter: CP_DOUBLE_QUOTE,
    delimiterLength: 3,
  },
  {
    token: quotedContentParenthesis,
    supportsInterpol: false,
    endDelimiter: CP_PAREN_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentCurly,
    supportsInterpol: false,
    endDelimiter: CP_CURLY_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentSquare,
    supportsInterpol: false,
    endDelimiter: CP_SQUARE_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentAngle,
    supportsInterpol: false,
    endDelimiter: CP_ANGLE_CLOSE,
    delimiterLength: 1,
  },
  {
    token: quotedContentBar,
    supportsInterpol: false,
    endDelimiter: CP_BAR,
    delimiterLength: 1,
  },
  {
    token: quotedContentSlash,
    supportsInterpol: false,
    endDelimiter: CP_SLASH,
    delimiterLength: 1,
  },
];

export const quotedContentTokens = new ExternalTokenizer((input, stack) => {
  // Note that always exactly one of the quoted content tokens is going
  // to be valid in the current tokenization context
  const info = QUOTED_CONTENT_INFOS.find((info) => stack.canShift(info.token));

  if (checkQuotedContent(input, info)) {
    input.acceptToken(info.token);
  }
});

function checkQuotedContent(input, info) {
  const isHeredoc = info.delimiterLength === 3;

  for (let hasContent = false; true; hasContent = true) {
    let newline = false;

    if (isNewline(input.next)) {
      input.advance();

      hasContent = true;
      newline = true;

      while (isWhitespace(input.next)) {
        input.advance();
      }
    }

    if (input.next === info.endDelimiter) {
      let length = 1;

      while (
        length < info.delimiterLength &&
        input.peek(length) === info.endDelimiter
      ) {
        length++;
      }

      if (length === info.delimiterLength && (!isHeredoc || newline)) {
        return hasContent;
      } else {
        input.advance(length);
      }
    } else {
      if (input.next === CP_HASH) {
        if (info.supportsInterpol && input.peek(1) === CP_CURLY_OPEN) {
          return hasContent;
        }
      } else if (input.next === CP_BACKSLASH) {
        if (isHeredoc && input.peek(1) === CP_NEWLINE) {
          // We need to know about the newline to correctly recognise
          // heredoc end delimiter, so we intentionally ignore
          // escaping
        } else if (
          info.supportsInterpol ||
          input.peek(1) === info.endDelimiter
        ) {
          return hasContent;
        }
      } else if (input.next === -1) {
        // If we reached the end of the file, this means there is no
        // end delimiter, so the syntax is invalid. In that case we
        // want to treat all the scanned content as quoted content.
        return hasContent;
      }

      input.advance();
    }
  }

  return false;
}

export const sigilTokens = new ExternalTokenizer((input, stack) => {
  let length = 0;

  while (
    (CP_A_LOWER <= input.next && input.next <= CP_Z_LOWER) ||
    (CP_A_UPPER <= input.next && input.next <= CP_Z_UPPER) ||
    (CP_ZERO <= input.next && input.next <= CP_NINE)
  ) {
    input.advance();
    length++;
  }

  if (length > 0) {
    input.acceptToken(SigilModifiers);
  }
});

export const immediateTokens = new ExternalTokenizer((input, stack) => {
  if (isWhitespace(input.peek(-1))) return;

  if (stack.canShift(immediateParenOpen) && input.next === CP_PAREN_OPEN) {
    input.advance();
    input.acceptToken(immediateParenOpen);
  } else if (
    stack.canShift(immediateSquareOpen) &&
    input.next === CP_SQUARE_OPEN
  ) {
    input.advance();
    input.acceptToken(immediateSquareOpen);
  } else if (
    stack.canShift(immediateColonWhitespace) &&
    input.next === CP_COLON
  ) {
    input.advance();
    if (isWhitespace(input.next)) {
      input.acceptToken(immediateColonWhitespace);
    }
  }
});

export const beforeUnaryOpToken = new ExternalTokenizer((input, stack) => {
  if (!isInlineWhitespace(input.next)) return;

  input.advance();

  while (isInlineWhitespace(input.next)) {
    input.advance();
  }

  // before unary +
  if (input.next === CP_PLUS) {
    const next = input.peek(1);
    if (
      next !== CP_PLUS &&
      next !== CP_COLON &&
      next !== CP_SLASH &&
      !isWhitespace(next)
    ) {
      input.acceptToken(beforeUnaryOp);
    }

    // before unary -
  } else if (input.next === CP_MINUS) {
    const next = input.peek(1);
    if (
      next !== CP_MINUS &&
      next !== CP_ANGLE_CLOSE &&
      next !== CP_COLON &&
      next !== CP_SLASH &&
      !isWhitespace(next)
    ) {
      input.acceptToken(beforeUnaryOp);
    }
  }
});

const ATOM_START = /[\p{ID_Start}_]/u;
const ATOM_CONTINUE = /[\p{ID_Continue}@]/u;

export const atomWordToken = new ExternalTokenizer((input, stack) => {
  if (input.next === CP_COLON) {
    input.advance();

    let [nextCodepointString, nextOffset] = peekCodepoint(input);
    if (ATOM_START.test(nextCodepointString)) {
      do {
        input.advance(nextOffset);
        [nextCodepointString, nextOffset] = peekCodepoint(input);
      } while (ATOM_CONTINUE.test(nextCodepointString));

      if (
        input.next === CP_QUESTION_MARK ||
        input.next === CP_EXCLAMATION_MARK
      ) {
        input.advance();
      }

      input.acceptToken(atomWord);
    }
  }
});

export const keywordWordToken = new ExternalTokenizer((input, stack) => {
  let [nextCodepointString, nextOffset] = peekCodepoint(input);
  if (ATOM_START.test(nextCodepointString)) {
    do {
      input.advance(nextOffset);
      [nextCodepointString, nextOffset] = peekCodepoint(input);
    } while (ATOM_CONTINUE.test(nextCodepointString));

    if (input.next === CP_QUESTION_MARK || input.next === CP_EXCLAMATION_MARK) {
      input.advance();
    }

    if (input.next === CP_COLON) {
      input.advance();

      if (isWhitespace(input.next)) {
        input.acceptToken(keywordWord);
      }
    }
  }
});

const IDENTIFIER_START =
  /[_\p{Ll}\p{Lm}\p{Lo}\p{Nl}\u1885\u1886\u2118\u212E\u309B\u309C]/u;

const IDENTIFIER_CONTINUE = /[\p{ID_Continue}]/u;

export const identifierToken = new ExternalTokenizer((input, stack) => {
  let [nextCodepointString, nextOffset] = peekCodepoint(input);

  const isUnderscored = nextCodepointString === "_";
  const token = isUnderscored ? underscoredIdentifier : identifier;

  if (IDENTIFIER_START.test(nextCodepointString)) {
    do {
      input.advance(nextOffset);
      [nextCodepointString, nextOffset] = peekCodepoint(input);
    } while (IDENTIFIER_CONTINUE.test(nextCodepointString));

    if (input.next === CP_QUESTION_MARK || input.next === CP_EXCLAMATION_MARK) {
      input.advance();
    }

    input.acceptToken(token);
  } else if (input.next === CP_DOT) {
    input.advance();
    if (input.next === CP_DOT) {
      input.advance();
      if (input.next === CP_DOT) {
        input.advance();
        if (isTokenEnd(input.next)) {
          input.acceptToken(token);
        }
      }
    }
  }
});

export const notInToken = new ExternalTokenizer((input, stack) => {
  if (input.next === CP_N_LOWER) {
    input.advance();
    if (input.next === CP_O_LOWER) {
      input.advance();
      if (input.next === CP_T_LOWER) {
        input.advance();
        while (isInlineWhitespace(input.next)) {
          input.advance();
        }
        if (input.next === CP_I_LOWER) {
          input.advance();
          if (input.next === CP_N_LOWER) {
            input.advance();
            if (isTokenEnd(input.next)) {
              input.acceptToken(notIn);
            }
          }
        }
      }
    }
  }
});

export const doubleSlashToken = new ExternalTokenizer((input, stack) => {
  if (input.next === CP_SLASH) {
    input.advance();
    if (input.next === CP_SLASH) {
      input.advance();
      input.acceptToken(doubleSlash);
    }
  }
});

export const atToken = new ExternalTokenizer((input, stack) => {
  if (input.next === CP_AT) {
    input.advance();

    // We lookahead for doc, moduledoc or typedoc as a simple heuristic
    if (
      (input.next === CP_D_LOWER &&
        input.peek(1) === CP_O_LOWER &&
        input.peek(2) === CP_C_LOWER &&
        isWhitespace(input.peek(3))) ||
      (input.next === CP_M_LOWER &&
        input.peek(1) === CP_O_LOWER &&
        input.peek(2) === CP_D_LOWER &&
        input.peek(3) === CP_U_LOWER &&
        input.peek(4) === CP_L_LOWER &&
        input.peek(5) === CP_E_LOWER &&
        input.peek(6) === CP_D_LOWER &&
        input.peek(7) === CP_O_LOWER &&
        input.peek(8) === CP_C_LOWER &&
        isWhitespace(input.peek(9))) ||
      (input.next === CP_T_LOWER &&
        input.peek(1) === CP_Y_LOWER &&
        input.peek(2) === CP_P_LOWER &&
        input.peek(3) === CP_E_LOWER &&
        input.peek(4) === CP_D_LOWER &&
        input.peek(5) === CP_O_LOWER &&
        input.peek(6) === CP_C_LOWER &&
        isWhitespace(input.peek(7)))
    ) {
      input.acceptToken(docAt);
    }
  }
});

export const newlineTokens = new ExternalTokenizer((input, stack) => {
  if (input.next === CP_CR) {
    input.advance();
  }

  if (input.next === CP_NEWLINE) {
    input.advance();

    let offset = 0;
    let newlineAhead = false;

    while (isWhitespace(input.peek(offset))) {
      newlineAhead = newlineAhead || isNewline(input.peek(offset));
      offset++;
    }

    if (stack.canShift(newlineBeforeDo) && input.peek(offset) === CP_D_LOWER) {
      if (input.peek(offset + 1) === CP_O_LOWER) {
        if (isTokenEnd(input.peek(offset + 2))) {
          input.acceptToken(newlineBeforeDo);
          return;
        }
      }
    }

    if (
      stack.canShift(newlineBeforeBinaryOperator) &&
      isOperator(input, offset)
    ) {
      input.acceptToken(newlineBeforeBinaryOperator);
      return;
    }

    // If there is a semicolon, it is the terminator. If there is a
    // comment, we ignore this newline, since there's a newline after
    // the comment, and possibly a semicolon. If there is any newline
    // ahead that could also act as a terminator, we let this one be
    // skipped instead.
    if (
      stack.canShift(newlineTerminator) &&
      input.peek(offset) !== CP_SEMICOLON &&
      input.peek(offset) !== CP_HASH &&
      !newlineAhead
    ) {
      input.acceptToken(newlineTerminator);
    }
  }
});

function isOperator(input, offset = 0) {
  // &&, &&&
  if (input.peek(offset) === CP_AMPERSAND) {
    offset++;
    if (input.peek(offset) === CP_AMPERSAND) {
      offset++;
      if (input.peek(offset) === CP_AMPERSAND) {
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    }
    // =, ==, ===, =~, =>
  } else if (input.peek(offset) === CP_EQUALS) {
    if (input.peek(offset) === CP_EQUALS) {
      offset++;
      if (input.peek(offset) === CP_EQUALS) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    } else if (input.peek(offset) === CP_TILDE) {
      offset++;
      return isOperatorEnd(input, offset);
    } else if (input.peek(1) === CP_ANGLE_CLOSE) {
      offset++;
      return isOperatorEnd(input, offset);
    } else {
      return isOperatorEnd(input, offset);
    }
    // ::
  } else if (input.peek(offset) === CP_COLON) {
    offset++;
    if (input.peek(offset) === CP_COLON) {
      offset++;
      // Ignore ::: atom
      if (input.peek(offset) === CP_COLON) return false;
      return isOperatorEnd(input, offset);
    }
    // ++, +++
  } else if (input.peek(offset) === CP_PLUS) {
    offset++;
    if (input.peek(offset) === CP_PLUS) {
      offset++;
      if (input.peek(offset) === CP_PLUS) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    }
    // --, ---, ->
  } else if (input.peek(offset) === CP_MINUS) {
    offset++;
    if (input.peek(offset) === CP_MINUS) {
      offset++;
      if (input.peek(offset) === CP_MINUS) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    } else if (input.peek(offset) === CP_ANGLE_CLOSE) {
      offset++;
      return isOperatorEnd(input, offset);
    }
    // <, <=, <-, <>, <~, <~>, <|>, <<<, <<~
  } else if (input.peek(offset) === CP_ANGLE_OPEN) {
    offset++;
    if (
      input.peek(offset) === CP_EQUALS ||
      input.peek(offset) === CP_MINUS ||
      input.peek(offset) === CP_ANGLE_CLOSE
    ) {
      offset++;
      return isOperatorEnd(input, offset);
    } else if (input.peek(offset) === CP_TILDE) {
      offset++;
      if (input.peek(offset) === CP_ANGLE_CLOSE) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    } else if (input.peek(offset) === CP_BAR) {
      offset++;
      if (input.peek(offset) === CP_ANGLE_CLOSE) {
        offset++;
        return isOperatorEnd(input, offset);
      }
    } else if (input.peek(offset) === CP_ANGLE_OPEN) {
      offset++;
      if (
        input.peek(offset) === CP_ANGLE_OPEN ||
        input.peek(offset) === CP_TILDE
      ) {
        offset++;
        return isOperatorEnd(input, offset);
      }
    } else {
      return isOperatorEnd(input, offset);
    }
    // >, >=, >>>
  } else if (input.peek(offset) === CP_ANGLE_CLOSE) {
    offset++;
    if (input.peek(offset) === CP_EQUALS) {
      offset++;
      return isOperatorEnd(input, offset);
    } else if (input.peek(offset) === CP_ANGLE_CLOSE) {
      offset++;
      if (input.peek(offset) === CP_ANGLE_CLOSE) {
        offset++;
        return isOperatorEnd(input, offset);
      }
    } else {
      return isOperatorEnd(input, offset);
    }
    // ^^^
  } else if (input.peek(offset) === CP_CARET) {
    offset++;
    if (input.peek(offset) === CP_CARET) {
      offset++;
      if (input.peek(offset) === CP_CARET) {
        offset++;
        return isOperatorEnd(input, offset);
      }
    }
    // !=, !==
  } else if (input.peek(offset) === CP_EXCLAMATION_MARK) {
    offset++;
    if (input.peek(offset) === CP_EQUALS) {
      offset++;
      if (input.peek(offset) === CP_EQUALS) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    }
    // ~>, ~>>
  } else if (input.peek(offset) === CP_TILDE) {
    offset++;
    if (input.peek(offset) === CP_ANGLE_CLOSE) {
      offset++;
      if (input.peek(offset) === CP_ANGLE_CLOSE) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    }
    // |, ||, |||, |>
  } else if (input.peek(offset) === CP_BAR) {
    offset++;
    if (input.peek(offset) === CP_BAR) {
      offset++;
      if (input.peek(offset) === CP_BAR) {
        offset++;
        return isOperatorEnd(input, offset);
      } else {
        return isOperatorEnd(input, offset);
      }
    } else if (input.peek(offset) === CP_ANGLE_CLOSE) {
      offset++;
      return isOperatorEnd(input, offset);
    } else {
      return isOperatorEnd(input, offset);
    }
    // *, **
  } else if (input.peek(offset) === CP_STAR) {
    offset++;
    if (input.peek(offset) === CP_STAR) {
      offset++;
      return isOperatorEnd(input, offset);
    } else {
      return isOperatorEnd(input, offset);
    }
    // / //
  } else if (input.peek(offset) === CP_SLASH) {
    offset++;
    if (input.peek(offset) === CP_SLASH) {
      offset++;
      return isOperatorEnd(input, offset);
    } else {
      return isOperatorEnd(input, offset);
    }
    // ., ..
  } else if (input.peek(offset) === CP_DOT) {
    offset++;
    if (input.peek(offset) === CP_DOT) {
      offset++;
      // Ignore ... identifier
      if (input.peek(offset) === CP_DOT) return false;
      return isOperatorEnd(input, offset);
    } else {
      return isOperatorEnd(input, offset);
    }
    // double slash
  } else if (input.peek(offset) === CP_BACKSLASH) {
    offset++;
    if (input.peek(offset) === CP_BACKSLASH) {
      offset++;
      return isOperatorEnd(input, offset);
    }
    // when
  } else if (input.peek(offset) === CP_W_LOWER) {
    offset++;
    if (input.peek(offset) === CP_H_LOWER) {
      offset++;
      if (input.peek(offset) === CP_E_LOWER) {
        offset++;
        if (input.peek(offset) === CP_N_LOWER) {
          offset++;
          return isTokenEnd(input.peek(offset)) && isOperatorEnd(input, offset);
        }
      }
    }
    // and
  } else if (input.peek(offset) === CP_A_LOWER) {
    offset++;
    if (input.peek(offset) === CP_N_LOWER) {
      offset++;
      if (input.peek(offset) === CP_D_LOWER) {
        offset++;
        return isTokenEnd(input.peek(offset)) && isOperatorEnd(input, offset);
      }
    }
    // or
  } else if (input.peek(offset) === CP_O_LOWER) {
    offset++;
    if (input.peek(offset) === CP_R_LOWER) {
      offset++;
      return isTokenEnd(input.peek(offset)) && isOperatorEnd(input, offset);
    }
    // in
  } else if (input.peek(offset) === CP_I_LOWER) {
    offset++;
    if (input.peek(offset) === CP_N_LOWER) {
      offset++;
      return isTokenEnd(input.peek(offset)) && isOperatorEnd(input, offset);
    }
    // not in
  } else if (input.peek(offset) === CP_N_LOWER) {
    offset++;
    if (input.peek(offset) === CP_O_LOWER) {
      offset++;
      if (input.peek(offset) === CP_T_LOWER) {
        offset++;
        while (isInlineWhitespace(input.peek(offset))) {
          offset++;
        }
        if (input.peek(offset) === CP_I_LOWER) {
          offset++;
          if (input.peek(offset) === CP_N_LOWER) {
            offset++;
            return (
              isTokenEnd(input.peek(offset)) && isOperatorEnd(input, offset)
            );
          }
        }
      }
    }
  }
}

function isOperatorEnd(input, offset) {
  // Keyword
  if (input.peek(offset) === CP_COLON) {
    const isKeywordEnd = isWhitespace(input.peek(offset + 1));
    return !isKeywordEnd;
  }
  while (isInlineWhitespace(input.peek(offset))) {
    offset++;
  }

  // Operator identifier with arity
  if (input.peek(offset) === CP_SLASH) {
    offset++;
    while (isWhitespace(input.peek(offset))) {
      offset++;
    }
    if (isDigit(input.peek(offset))) {
      return false;
    }
  }

  return true;
}

function isInlineWhitespace(c) {
  return c === CP_SPACE || c === CP_TAB;
}

function isWhitespace(c) {
  return c === CP_SPACE || c === CP_TAB || c === CP_NEWLINE || c === CP_CR;
}

function isNewline(c) {
  return c === CP_NEWLINE || c === CP_CR;
}

function isDigit(c) {
  return CP_ZERO <= c && c <= CP_NINE;
}

const TOKEN_TERMINATORS = new Set([
  // Operator starts
  CP_AT,
  CP_DOT,
  CP_PLUS,
  CP_MINUS,
  CP_CARET,
  CP_MINUS,
  CP_STAR,
  CP_SLASH,
  CP_ANGLE_OPEN,
  CP_ANGLE_CLOSE,
  CP_BAR,
  CP_TILDE,
  CP_EQUALS,
  CP_AMPERSAND,
  CP_BACKSLASH,
  CP_PERCENT,
  // Delimiters
  CP_CURLY_OPEN,
  CP_CURLY_CLOSE,
  CP_SQUARE_OPEN,
  CP_SQUARE_CLOSE,
  CP_PAREN_OPEN,
  CP_PAREN_CLOSE,
  CP_DOUBLE_QUOTE,
  CP_SINGLE_QUOTE,
  // Separators
  CP_COMMA,
  CP_SEMICOLON,
  // Comment
  CP_HASH,
]);

// Note: this is a heuristic as we only use this to distinguish word
// operators and we don't want to include complex Unicode ranges
function isTokenEnd(c) {
  if (TOKEN_TERMINATORS.has(c)) {
    return true;
  }

  return isWhitespace(c) || c === -1;
}

// The input streams UTF-16 code units, this function returns a string
// with the next code point (possibly two code units)
function peekCodepoint(input) {
  const next = input.next;

  // Merge UTF-16 surrogate code units
  if (0xd800 <= next && next <= 0xdbff) {
    const nextNext = input.peek(1);

    if (0xdc00 <= nextNext && nextNext <= 0xdfff) {
      return [String.fromCharCode(next, nextNext), 2];
    }
  }

  return [String.fromCharCode(next), 1];
}
