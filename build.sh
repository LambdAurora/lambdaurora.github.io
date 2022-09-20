#!/bin/sh

if [ -z ${DENO+x} ];
then DENO=deno;
fi

$DENO run --allow-read --allow-write --allow-net --allow-run --unstable --import-map=import_map.json build.ts $@
