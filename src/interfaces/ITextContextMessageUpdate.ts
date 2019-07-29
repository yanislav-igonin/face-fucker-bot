
import { MessageEntity } from 'telegram-typings';

import {
  IUserMessage,
  IUserUpdate,
  IUserContextMessageUpdate,
} from './IUserContextMessageUpdate';

interface ITextMessage extends IUserMessage {
  entities: MessageEntity[];
  text: string;
}

interface ITextUpdate extends IUserUpdate {
  message: ITextMessage;
}

export interface ITextContextMessageUpdate extends IUserContextMessageUpdate {
  update: ITextUpdate;
}
