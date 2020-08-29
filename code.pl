:- use_module(library(chr)).
:- chr_constraint min/1.
:- chr_constraint max/1.
min(A) \ min(B) <=> A =< B | true.
max(A) \ max(B) <=> A >= B | true.
