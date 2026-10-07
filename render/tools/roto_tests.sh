#!/bin/bash
# Roto test suite: render each test shot at 1080p and build before/after (render/out/roto_tests/<name>/).
#   bash render/tools/roto_tests.sh [name ...]
set -e
cd "$(dirname "$0")/.."
MPY=${MPY:-/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python}
run() { # name spec t0 t1 sheet crop [extra compare args]
  local name=$1 spec=$2 t0=$3 t1=$4 sheet=$5 crop=$6; shift 6
  node tools/roto_test.mjs --spec "$spec" --scale 1 --out out/roto_tests/$name/frames --workers 8 2>&1 | grep -v 404 | tail -1
  clip=$(echo "$spec" | sed 's/.*"clip":"\([^"]*\)".*/\1/')
  (cd .. && $MPY tools/roto_compare.py --name $name --clip $clip --frames render/out/roto_tests/$name/frames --t0 $t0 --t1 $t1 --audio --sheet $sheet --crop $crop "$@")
}
want() { [ -z "$ALL" ] || [[ " $ALL " == *" $1 "* ]]; }
ALL="$*"
want K_2.1 && run K_2.1 '{"clip":"K_2.1/take_1","paper":"silk","shotPaper":"silk","t0":32.417,"t1":35.846,"grain":21}' 32.417 35.846 32.6,34.0,35.6 700,560,440,300
want K_3.6b && run K_3.6b '{"clip":"K_3.6b/take_2","paper":"silk","shotPaper":"silk","t0":62.103,"t1":66.1,"grain":36}' 62.103 66.1 62.3,64.0,65.9 500,250,440,440
want K_4.9 && run K_4.9 '{"clip":"K_4.9/take_2","paper":"ink","shotPaper":"xuan","t0":97.732,"t1":101.334,"grain":49}' 97.732 101.334 97.9,99.0,100.2,101.2 760,200,440,440
want K_5.1 && run K_5.1 '{"clip":"K_5.1/take_1","paper":"ink","shotPaper":"xuan","t0":101.334,"t1":104.919,"grain":51}' 101.334 104.919 101.5,102.6,103.8,104.8 820,240,440,440
want J_7.D2 && run J_7.D2 '{"clip":"J_7.D2/take_2","paper":"gold","shotPaper":"indigo","t0":163.533,"t1":167.5,"grain":92,"section":"07_drop","glow":0.35}' 163.533 167.5 163.7,165.0,166.3,167.4 1100,250,440,440
want LS2 && run LS2 '{"clip":"LS2/take_7","paper":"silk","shotPaper":"silk","t0":54.09,"t1":57.83,"ref_t0":53.79,"lag":-0.102,"lock":0.25,"grain":34}' 54.09 57.83 54.6,55.3,56.4,57.4 1040,160,440,440 --ref_t0 53.79 --lag -0.102
