FROM node:10

ENV MAGICK_URL "http://imagemagick.org/download/releases"
ENV MAGICK_VERSION 7.0.8-29

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
    libpng-dev libjpeg-dev libtiff-dev liblqr-dev \
  && apt-get remove -y imagemagick \
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
    --without-webp \
    --without-x \
    --without-xml \
  && make \
  && make install \
  && ldconfig /usr/local/lib \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
  
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD ["npm", "start"]