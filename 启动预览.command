#!/bin/bash
cd "$(dirname "$0")" || exit 1
preview_node="$(command -v node || true)"
if [ -z "$preview_node" ]; then
  for candidate in "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    if [ -x "$candidate" ]; then preview_node="$candidate"; break; fi
  done
fi
if [ -z "$preview_node" ]; then
  printf '请先安装 Node.js 22 或更新版本，再打开预览。\n'
  read -r -p '按回车关闭。'
  exit 1
fi
PORT=4196 "$preview_node" website-code/scripts/serve.mjs --open
