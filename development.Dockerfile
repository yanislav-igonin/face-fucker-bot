FROM node:14

ENV MAGICK_URL "https://imagemagick.org/download/releases"
ENV MAGICK_VERSION 7.1.0-2

RUN apt update -y \
  && apt install -y --no-install-recommends \
    libpng-dev libjpeg-dev liblqr-dev \
  && apt remove -y imagemagick \
  && cd /tmp \
  && curl -SLO "${MAGICK_URL}/ImageMagick-${MAGICK_VERSION}.tar.xz" \
  && curl -SLO "${MAGICK_URL}/ImageMagick-${MAGICK_VERSION}.tar.xz.asc" \
  && tar xf "ImageMagick-${MAGICK_VERSION}.tar.xz" \
  && cd "ImageMagick-${MAGICK_VERSION}" \
  && ./configure \
    --disable-static \
    --enable-shared \
    --with-jpeg \
    --with-lqr \
    --with-png \
    --with-webp \
    --with-quantum-depth=8 \
  && make \
  && make install \
  && ldconfig /usr/local/lib \
  && apt -y autoclean \
  && apt -y autoremove \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt update

RUN apt install -y --no-install-recommends ffmpeg

WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm i
CMD ["npm", "run", "start:dev"]