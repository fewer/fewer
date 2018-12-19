#!/bin/sh
if [ -f ./.env ]
then
  set -a
  . ./.env
  "$@"
  set +a
else
  echo "ERROR: no .env file defined. Local integration tests are unlikely to succeed."
fi