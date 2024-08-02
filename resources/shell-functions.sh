#!/bin/bash

function pg() {
  local query=""
  local args=()
  local input_from_stdin=1

  while (( "$#" )); do
    if [[ "$1" == "-c" ]]; then
      if [[ -n "$2" ]]; then
        query="$2"
        shift 2
        input_from_stdin=0
        break
      else
        echo "Error: Expected a query after -c flag" >&2
        return 1
      fi
    else
      args+=("$1")
      shift
    fi
  done

  if [[ "$input_from_stdin" -eq 1 ]]; then
    query=$(cat)
  fi

  psql -X -A -F $'\t' --no-align --pset footer=off "${args[@]}" -c "$query"
}

function ggplot() {
  if [[ "$1" == "-f" ]]; then
    shift
    rush run --library tidyverse "$(cat "$1")" -
  else
    rush run --library tidyverse "$@" -
  fi
}

function fsharp() {
  local tmpfile=$(mktemp /tmp/temp_fsharp_script.XXXXXX.fsx)
  echo "$@" > $tmpfile
  dotnet fsi $tmpfile 2> /dev/null
  rm $tmpfile
}

function nodejsx() {
  node -e "
  const { execSync } = require('child_process');
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const vm = require('vm');
  const jsxCode = \`${1}\`;
  const stdin = fs.readFileSync(0, 'utf8');
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, \`nodejsx-\${Date.now()}.jsx\`);
  try {
    const fullCode = \`
      import React from 'react';
      import ReactDOMServer from 'react-dom/server';
      const STDIN = \${JSON.stringify(stdin)};
      \${jsxCode}
      if (typeof App !== 'undefined') {
        console.log(ReactDOMServer.renderToString(React.createElement(App)));
      }
    \`;
    fs.writeFileSync(tmpFile, fullCode);
    const transpiledCode = execSync(
      \`esbuild \${tmpFile} --format=cjs --target=node14 --bundle --external:react --external:react-dom/server\`,
      { encoding: 'utf8' }
    );
    const context = vm.createContext({
      require,
      process,
      console,
      Buffer,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    });
    vm.runInContext(transpiledCode, context);
  } finally {
    fs.unlinkSync(tmpFile);
  }
  "
}

function prependcss() {
  local html="$(cat -)"
  local css=""
  local inline_css=""

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -c)
        shift
        inline_css+="$1"
        shift
        ;;
      *)
        if [[ -f "$1" ]]; then
          css+=$(cat "$1")
        fi
        shift
        ;;
    esac
  done

  css="$css$inline_css"
  echo "<style>$css</style>$html"
}

function pngcopyhtml() {
  tee >(pngtohtml) >(impbcopy -) > /dev/null
}

function pngtohtml() {
  python3 -c "
import base64
import sys
png_bytes = sys.stdin.buffer.read()
data_uri = 'data:image/png;base64,' + base64.b64encode(png_bytes).decode()
print(f'<img src=\"{data_uri}\">')
  "
}

function tsvtohtml() {
  python3 -c "
import csv
import sys
import json

reader = csv.reader(sys.stdin, delimiter='\t')
rows = list(reader)

html = '<table>\n'
for row in rows:
    html += '  <tr>\n'
    for cell in row:
        html += f'    <td>{cell}</td>\n'
    html += '  </tr>\n'
html += '</table>\n'

data = rows
script = f'<script>const data = {json.dumps(data)};</script>\n'
html = script + html

sys.stdout.write(html)
  "
}

function tablecho() {
  echo "$@"
}

function impbcopy() {
  if command -v xclip >/dev/null 2>&1; then
    xclip -selection clipboard
  elif command -v pbcopy >/dev/null 2>&1; then
    pbcopy
  else
    echo "Error: No clipboard utility available. Please install xclip (Linux) or use pbcopy (macOS)." >&2
    return 1
  fi
}

function tsvtocsv() {
  awk 'BEGIN { FS="\t"; OFS="," } {
    rebuilt=0
    for(i=1; i<=NF; ++i) {
      if ($i ~ /,/ && $i !~ /^".*"$/) { 
        gsub("\"", "\"\"", $i)
        $i = "\"" $i "\""
        rebuilt=1 
      }
    }
    if (!rebuilt) { $1=$1 }gs
    print
  }'
}