import { PhotoSize } from 'telegram-typings';

import {
  IUserMessage,
  IUserUpdate,
  IUserContextMessageUpdate,
} from './IUserContextMessageUpdate';

interface IPhotoMessage extends IUserMessage {
  photo: PhotoSize[];
}

interface IPhotoUpdate extends IUserUpdate {
  message: IPhotoMessage;
}

export interface IPhotoContextMessageUpdate extends IUserContextMessageUpdate {
  update: IPhotoUpdate;
}
