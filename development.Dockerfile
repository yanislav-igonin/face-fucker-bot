FROM node:10

ENV MAGICK_URL "https://imagemagick.org/download/releases"
ENV MAGICK_VERSION 6.9.1-10

RUN apt update -y \
  && apt install -y --no-install-recommends \
    libpng-dev libjpeg-dev libtiff-dev liblqr-dev \
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
    --with-jp2 \
    --with-lqr \
    --with-openjp2 \
    --with-png \
    --with-tiff \
    --with-webp \
    --with-quantum-depth=8 \
    --without-magick-plus-plus \
    --without-bzlib \
    --without-zlib \
    --without-dps \
    --without-fftw \
    --without-fpx \
    --without-djvu \
    --without-fontconfig \
    --without-freetype \
    --without-jbig \
    --without-lcms \
    --without-lcms2 \
    --without-lzma \
    --without-openexr \
    --without-pango \
    --without-x \
    --without-xml \
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
COPY ./src ./src
RUN npm i
CMD ["npm", "run", "dev"]