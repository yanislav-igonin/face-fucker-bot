import { VideoNote } from 'telegram-typings';

import {
  IUserMessage,
  IUserUpdate,
  IUserContextMessageUpdate,
} from './IUserContextMessageUpdate';

interface IVideoNoteMessage extends IUserMessage {
  video_note: VideoNote;
}

interface IVideoNoteUpdate extends IUserUpdate {
  message: IVideoNoteMessage;
}

export interface IVideoNoteContextMessageUpdate extends IUserContextMessageUpdate {
  update: IVideoNoteUpdate;
}
