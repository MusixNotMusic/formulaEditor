/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

%%
\s+                           /* skip whitespace */
[0-9]+("."[0-9]+)?\b          %{ yy.matchedList.push({'text': yytext, type: 'number'}); return 'NUMBER'; %};
[A-Za-z_\u4E00-\u9FA5]+       %{ yy.matchedList.push({'text': yytext, type: 'id'}); return 'ID'; %};
"*"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '*'; %};
"/"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '/'; %};
"-"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '-'; %};
"+"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '+'; %};
"^"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '^'; %};
"("                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return '('; %};
")"                           %{ yy.matchedList.push({'text': yytext, type: 'operator'}); return ')'; %};
"PI"                          %{ yy.matchedList.push({'text': yytext, type: 'number'}); return 'PI'; %};
"E"                           %{ yy.matchedList.push({'text': yytext, type: 'number'}); return 'E'; %};
<<EOF>>                       %{ yy.matchedList.push({'text': yytext, type: 'eof'}); return 'EOF'; %};

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : e EOF
        { return 'accept'; }
    ;

e
    : e '+' e
        // {$$ = $1+$3;}
    | e '-' e
        // {$$ = $1-$3;}
    | e '*' e
        // {$$ = $1*$3;}
    | e '/' e
        // {$$ = $1/$3;}
    | e '^' e
        // {$$ = Math.pow($1, $3);}
    | '-' e %prec UMINUS
        // {$$ = -$2;}
    | '(' e ')'
        // {$$ = $2;}
    | NUMBER
        // {$$ = Number(yytext);}
    | E
        // {$$ = Math.E;}
    | PI
        // {$$ = Math.PI;}
    | ID
    ;
%%