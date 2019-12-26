import { PhotoSize } from 'telegram-typings';

import {
  UserMessage,
  UserUpdate,
  UserContextMessageUpdate,
} from './UserContextMessageUpdate';

interface PhotoMessage extends UserMessage {
  photo: PhotoSize[];
}

interface PhotoUpdate extends UserUpdate {
  message: PhotoMessage;
}

export interface PhotoContextMessageUpdate extends UserContextMessageUpdate {
  update: PhotoUpdate;
}
