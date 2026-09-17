#!/bin/sh
set -eu
cd "$(dirname "$0")"
ollama create aurel-tutor -f tutor.Modelfile
ollama create aurel-checker -f checker.Modelfile
ollama create aurel-helper -f helper.Modelfile
