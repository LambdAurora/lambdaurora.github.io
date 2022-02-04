#!/bin/sh

if [ -z ${DENO+x} ];
then DENO=deno;
fi

$DENO run --allow-read --allow-write --allow-net --allow-run --unstable build.mjs
