#!/bin/sh
if [ -f ./.env ]
then
  set -a
  . ./.env
  "$@"
  set +a
else
  if [[ -z "${IN_CI}" ]]
  then
    echo "ERROR: no .env file defined. Local integration tests are unlikely to succeed."
  else
    "$@"
  fi
fi