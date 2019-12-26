import { ContextMessageUpdate } from 'telegraf';
import {
  Message, Update, User,
} from 'telegram-typings';

export interface UserMessage extends Message {
  from: User;
}

export interface UserUpdate extends Update {
  message: UserMessage;
}

export interface UserContextMessageUpdate extends ContextMessageUpdate {
  update: UserUpdate;
}
