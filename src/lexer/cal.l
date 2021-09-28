%{
#include "y.tab.h"
%}

%%
[0-9]+          { yylval = atoi(yytext); return T_NUM; }
[-/+*()^\n]     { return yytext[0]; }
[ \t\r\a]+      { /* ignore all spaces */               }
.               { return 0; /* end when meet everything else */ }
%%

int yywrap(void) {
    return 1;
}
