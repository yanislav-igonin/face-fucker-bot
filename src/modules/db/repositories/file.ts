import db from '..';
import { File, User } from '../entities';

interface IFileData {
  type: string;
  size: number;
  user: User;
}

export const createFile = async (data: IFileData): Promise<File> => {
  const fileRepository = db.getRepository(File);
  const file = new File();
  file.type = data.type;
  file.user = data.user;
  file.size = data.size;
  await fileRepository.save(file);
  return file;
};
