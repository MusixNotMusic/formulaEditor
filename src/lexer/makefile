exec: 
	bison -dyv cal.y;
	flex cal.l;
	gcc lex.yy.c y.tab.c -o cal;
clean:
	rm -rf y.tab.c y.tab.h cal lex.yy.c y.output
