# This Dockerfile uses multi-stage build to customize DEV and PROD images:
# https://docs.docker.com/develop/develop-images/multistage-build/

# https://pythonspeed.com/articles/base-image-python-docker-images
FROM python:3.10-slim-bullseye AS development_build

LABEL name="Diango rest example app" \
    maintainer="Minh Hoang" \
    version="1.0"

# Sets utf-8 encoding for Python et al
ENV LANG=C.UTF-8
# Turns off writing .pyc files; superfluous on an ephemeral container.
ENV PYTHONDONTWRITEBYTECODE=1
# Seems to speed things up
ENV PYTHONUNBUFFERED=1

ARG DJANGO_ENV
ARG DEBIAN_FRONTEND="noninteractive"
ARG DEBCONF_NOWARNINGS="yes"

# NODE JS
ARG NODE_VERSION=14.16.0
ARG NODE_PACKAGE=node-v$NODE_VERSION-linux-x64
ARG NODE_HOME=/opt/$NODE_PACKAGE

ENV DJANGO_ENV=${DJANGO_ENV} \
    NODE_PATH=$NODE_HOME/lib/node_modules \
    PATH=$NODE_HOME/bin:$PATH \
    # python:
    PYTHONFAULTHANDLER=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PYTHONDONTWRITEBYTECODE=1 \
    # pip:
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    # dockerize:
    DOCKERIZE_VERSION=v0.6.1 \
    # tini:
    TINI_VERSION=v0.19.0 \
    # poetry:
    POETRY_VERSION=1.1.13 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR='/var/cache/pypoetry' \
    POETRY_HOME='/usr/local'

ARG DOCKERIZE_TARBALL="dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz"

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]

# System deps, we don't use exact versions because it is hard to update them, pin when needed:
# hadolint ignore=DL3008
RUN apt-get -qq update && apt-get -qq upgrade -y &> /dev/null && \
  apt-get -qq install --no-install-recommends -y &> /dev/null \
  bash build-essential curl gettext git openssh-client default-libmysqlclient-dev \
  # Installing `dockerize` utility:
  # https://github.com/jwilder/dockerize
  && curl -sSLO "https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/$DOCKERIZE_TARBALL" \
  && tar -C /usr/local/bin -xzvf $DOCKERIZE_TARBALL \
  && rm $DOCKERIZE_TARBALL && dockerize --version \
  # Installing `tini` utility:
  # https://github.com/krallin/tini
  # Get architecture to download appropriate tini release
  && dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" \
  && curl -o /usr/local/bin/tini -sSLO "https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-${dpkgArch}" \
  && chmod +x /usr/local/bin/tini && tini --version \
  # Installing `poetry` package manager:
  # https://github.com/python-poetry/poetry
  && curl -sSL "https://install.python-poetry.org" | python - \
  && poetry --version \
  # Install nodejs for pyright linter
  && if [ "$DJANGO_ENV" = "development" ]; then curl -sSL "https://nodejs.org/dist/v$NODE_VERSION/$NODE_PACKAGE.tar.gz" | tar -xzC /opt/; fi \
  # Cleaning cache:
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && apt-get clean -y && rm -rf /var/lib/apt/lists/*

WORKDIR /code

RUN groupadd -r djapp && useradd -d /code -r -g djapp djapp -u 1000 \
  && chown djapp:djapp -R /code \
  && mkdir -p /var/www/django/static /var/www/django/media \
  && chown djapp:djapp /var/www/django/static /var/www/django/media

# Copy only requirements, to cache them in docker layer
COPY --chown=djapp:djapp ./poetry.lock ./pyproject.toml ./docker/pycommon.b64 /code/

# Project initialization
# hadolint ignore=SC2046
RUN echo "$DJANGO_ENV" && poetry version \
    # Authorize SSH Host
    && mkdir -p ~/.ssh \
    && touch ~/.ssh/known_hosts && ssh-keyscan github.com >> ~/.ssh/known_hosts \
    # Add the ssh deployment keys and set permission
    && cat pycommon.b64 | base64 --decode > ~/.ssh/id_ed25519 && echo "" >> ~/.ssh/id_ed25519 \
    && chmod -R 400 ~/.ssh \
    # Install dependencies
    && poetry export --without-hashes $(if [ "$DJANGO_ENV" = "development" ]; then echo "--dev"; fi) \
    | pip install --disable-pip-version-check --no-compile -q -r /dev/stdin \
    # && poetry install --no-root --no-interaction --no-ansi -vv $(if [ "$DJANGO_ENV" = "production" ]; then echo "--no-dev"; fi) \
    && poetry debug \
    # Remove SSH keys
    && rm -rf ~/.ssh/ \
    # Cleaning poetry installation's cache for production:
    && if [ "$DJANGO_ENV" = "production" ]; then rm -rf "$POETRY_CACHE_DIR"; fi

# This is a special case. We need to run this script as an entry point:
COPY ./docker/django/entrypoint.sh /docker-entrypoint.sh

# Setting up proper permissions:
RUN chmod +x "/docker-entrypoint.sh"

# Running as non-root approval:
USER djapp

# We customize how our app is loaded with the custom entrypoint:
ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]


# The following stage is only for production:
FROM development_build AS production_build
COPY --chown=djapp:djapp . /code
