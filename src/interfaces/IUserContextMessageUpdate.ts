import { ContextMessageUpdate } from 'telegraf';
import {
  Message, Update, User,
} from 'telegram-typings';

export interface IUserMessage extends Message {
  from: User;
}

export interface IUserUpdate extends Update {
  message: IUserMessage;
}

export interface IUserContextMessageUpdate extends ContextMessageUpdate {
  update: IUserUpdate;
}
