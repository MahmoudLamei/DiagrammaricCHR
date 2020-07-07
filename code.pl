:-use_module(library(chr)).
:-chr_constraint color/1.

color(X), color(Y) <=> mix(X,Y,Z) | color(Z).

mix(red, blue, purple).