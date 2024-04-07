#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

# We are using `gunicorn` for production, see:
# http://docs.gunicorn.org/en/stable/configure.html

# Check that $DJANGO_ENV is set to "production",
# fail otherwise, since it may break things:
echo "DJANGO_ENV is $DJANGO_ENV"
if [ "$DJANGO_ENV" != 'production' ]; then
  echo 'Error: DJANGO_ENV is not set to "production".'
  echo 'Application will not start.'
  exit 1
fi

export DJANGO_ENV

# Run python specific scripts:
# Running migrations in startup script might not be the best option, see:
# docs/pages/template/production-checklist.rst
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py compilemessages

# Start gunicorn:
# Docs: http://docs.gunicorn.org/en/stable/settings.html
# Concerning `workers` setting see:
# https://adamj.eu/tech/2019/09/19/working-around-memory-leaks-in-your-django-app
# Sync worker settings = cpus * 2 + 1 (max = 9)
_MAX_W=9
WORKERS_CALC=$(($(nproc) * 2 + 1))
WORKER_NUMS=$(( WORKERS_CALC < _MAX_W ? WORKERS_CALC : _MAX_W ))
SOCK_FILE=$HOSTNAME.sock
curl --silent --fail --unix-socket run/gunicorn.sock sock-http || SOCK_FILE=gunicorn.sock

/usr/local/bin/gunicorn src.wsgi \
  --worker-class=gthread \
  --workers=$WORKER_NUMS \
  --threads=2 \
  --timeout=120 \
  --graceful-timeout=120 \
  --worker-connections=2048 \
  --max-requests=2048 \
  --max-requests-jitter=1000 \
  --bind=unix:run/$SOCK_FILE \
  --chdir='/code' \
  --log-file=- \
  --worker-tmp-dir='/dev/shm'
