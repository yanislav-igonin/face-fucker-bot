import { MessageEntity } from 'telegram-typings';

import {
  UserMessage,
  UserUpdate,
  UserContext,
} from './UserContextMessageUpdate';

interface TextMessage extends UserMessage {
  entities: MessageEntity[];
  text: string;
}

interface TextUpdate extends UserUpdate {
  message: TextMessage;
}

export interface TextContextMessageUpdate extends UserContext {
  update: TextUpdate;
}
