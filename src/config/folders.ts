import path from 'path';

interface FoldersConfig {
  imageUploads: string;
  imageProcessed: string;
  videoUploads: string;
  videoProcessed: string;
  videoSourceFrames: string;
  videoProcessedFrames: string;
}

const folders: FoldersConfig = {
  imageUploads: path.join(__dirname, '../../uploads/images/uploaded'),
  imageProcessed: path.join(__dirname, '../../uploads/images/processed'),
  videoUploads: path.join(__dirname, '../../uploads/videos/uploaded'),
  videoProcessed: path.join(__dirname, '../../uploads/videos/processed'),
  videoSourceFrames: path.join(__dirname, '../../uploads/videos/sourceFrames'),
  videoProcessedFrames: path.join(__dirname, '../../uploads/videos/processedFrames'),
};

export default folders;
