%{
#include <stdio.h>
#include <stdlib.h>
int yylex();
void yyerror(char* msg) {}
%}

%token T_NUM

%left '+' '-'
%left '*' '/'


%%

stat :   stat exp '\n'   { printf("ans = %d\n", $2); }
     |   /* empty */     { /* empty */ }
     ;

exp :   exp '+' exp       { $$ = $1 + $3; }
    |   exp '-' exp       { $$ = $1 - $3; }
    |   exp '*' exp       { $$ = $1 * $3; }
    |   exp '/' exp       { $$ = $1 / $3; }
    |   T_NUM             { $$ = $1; }
    |   '(' exp ')'       { $$ = $2; }
    ;

%%

int main() {
    return yyparse();
}