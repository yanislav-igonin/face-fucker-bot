import { Animation } from 'telegram-typings';

import {
  IUserMessage,
  IUserUpdate,
  IUserContextMessageUpdate,
} from './IUserContextMessageUpdate';

interface IAnimationMessage extends IUserMessage {
  animation: Animation;
}

interface IAnimationUpdate extends IUserUpdate {
  message: IAnimationMessage;
}

export interface IAnimationContextMessageUpdate extends IUserContextMessageUpdate {
  update: IAnimationUpdate;
}
