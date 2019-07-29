import { getRepository } from 'typeorm';
// import { User as IUserData } from 'telegram-typings';

import { File, User } from '../entities';

interface IFileData {
  type: string;
  size: number;
  user: User;
}

export const createFile = async (data: IFileData): Promise<File> => {
  const fileRepository = getRepository(File);
  const file = new File();
  file.type = data.type;
  file.user = data.user;
  file.size = data.size;
  await fileRepository.save(file);
  return file;
};
