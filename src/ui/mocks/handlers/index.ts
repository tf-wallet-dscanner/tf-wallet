import { DefaultRequestBody, MockedRequest, RestHandler } from 'msw';
import commonHandlers from './common';

const handlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  ...commonHandlers,
];

export default handlers;
