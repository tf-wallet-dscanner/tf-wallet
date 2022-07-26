import { Runtime } from 'webextension-polyfill-ts';

import { BackgroundMessages, ContentScriptMessages } from './messages';

export type IMessage<T> = {
  type: ContentScriptMessages | BackgroundMessages;
  data: T;
};

export type MessageListener = (
  sender: Runtime.MessageSender,
  data: IMessage<any>,
) => any;
