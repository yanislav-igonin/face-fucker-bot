import { Video } from 'telegram-typings';

import {
  IUserMessage,
  IUserUpdate,
  IUserContextMessageUpdate,
} from './IUserContextMessageUpdate';

interface IVideoMessage extends IUserMessage {
  video: Video;
}

interface IVideoUpdate extends IUserUpdate {
  message: IVideoMessage;
}

export interface IVideoContextMessageUpdate extends IUserContextMessageUpdate {
  update: IVideoUpdate;
}
