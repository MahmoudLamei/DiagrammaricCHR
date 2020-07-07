:- use_module(library(chr)).
:- chr_constraint color/1.

color(Y), color(X) <=> mix(X,Y,Z) | color(Z).
color(brown) \ color(_) <=> true.
mix(red,blue,purple).
mix(blue,yellow,green).
mix(yellow,red,orange).
