interface FileTypeConfig {
  image: string;
  sticker: string;
  video: string;
  video_note: string;
  animation: string;
}

const fileType: FileTypeConfig = {
  image: 'image',
  sticker: 'sticker',
  video: 'video',
  video_note: 'video_note',
  animation: 'animation',
};

export default fileType;
