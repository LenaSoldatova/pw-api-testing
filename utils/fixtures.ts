import { test as base, TestType } from '@playwright/test';
import { RequestHandler } from './request-handler';

export type TestOptions = {
  api: RequestHandler;
};

export const test = base.extend<TestOptions>({
    api: async({request}, use) => {
        const defaultUrl = 'https://conduit-api.bondaracademy.com/api';
        const requestHandler = new RequestHandler(request, defaultUrl);
        // before test logic
        await use(requestHandler);
        // after test logic
    }
});