import db from '..';
import { File, User } from '../entities';

interface FileData {
  type: string;
  size: number;
  user: User;
}

export const createFile = async (data: FileData) => {
  const fileRepository = db.getRepository(File);
  const file = new File();
  file.type = data.type;
  file.user = data.user;
  file.size = data.size;
  await fileRepository.save(file);
  return file;
};
