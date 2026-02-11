import { APIRequestContext, APIResponse } from 'playwright-core';

type QueryParams = Record<string, string | number | boolean>;
type HeadersMap = Record<string, string>;
type JsonBody = Record<string, unknown>;

export class RequestHandler {
  private _request: APIRequestContext;
  private _url = '';
  private _defaultUrl: string;

  private _path = '';
  private _params: QueryParams = {};
  private _headers: HeadersMap = {};
  private _body: JsonBody = {};

  constructor(request: APIRequestContext, defaultUrl: string) {
    this._request = request;
    this._defaultUrl = defaultUrl;
  }

  url(url: string) {
    this._url = url;
    return this;
  }

  path(path: string) {
    this._path = path;
    return this;
  }

  params(params: QueryParams) {
    this._params = params;
    return this;
  }

  headers(headers: HeadersMap) {
    this._headers = headers;
    return this;
  }

  body(body: JsonBody) {
    this._body = body;
    return this;
  }

  async getRequest<T>(statusCode: number): Promise<T> {
    const url = this.getUrl();
    const response = await this._request.get(url, { headers: this._headers });

    try {
      await this.assertStatus(response, statusCode, 'GET', url);
      return (await response.json()) as T;
    } finally {
      this.reset();
    }
  }

  async postRequest<T>(statusCode: number): Promise<T> {
    const url = this.getUrl();
    const response = await this._request.post(url, {
      headers: this._headers,
      data: this._body,
    });

    try {
      await this.assertStatus(response, statusCode, 'POST', url);
      return (await response.json()) as T;
    } finally {
      this.reset();
    }
  }

  async putRequest<T>(statusCode: number): Promise<T> {
    const url = this.getUrl();
    const response = await this._request.put(url, {
      headers: this._headers,
      data: this._body,
    });

    try {
      await this.assertStatus(response, statusCode, 'PUT', url);
      return (await response.json()) as T;
    } finally {
      this.reset();
    }
  }

  async deleteRequest(statusCode: number): Promise<void> {
    const url = this.getUrl();
    const response = await this._request.delete(url, { headers: this._headers });

    try {
      await this.assertStatus(response, statusCode, 'DELETE', url);
    } finally {
      this.reset();
    }
  }

  private getUrl(): string {
    const baseRaw = this._url.trim().length > 0 ? this._url : this._defaultUrl;
    const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`;
    const path = this._path.startsWith('/') ? this._path.slice(1) : this._path;

    const url = new URL(path, base);

    for (const [key, value] of Object.entries(this._params)) {
      url.searchParams.append(key, String(value));
    }

    return url.toString();
  }

  private async assertStatus(
    response: APIResponse,
    expectedStatus: number,
    method: string,
    url: string
  ): Promise<void> {
    const actual = response.status();
    if (actual !== expectedStatus) {
      const text = await response.text();
      throw new Error(`${method} ${url} expected ${expectedStatus} but got ${actual}. Body: ${text}`);
    }
  }

  private reset(): void {
    this._path = '';
    this._params = {};
    this._headers = {};
    this._body = {};
    this._url = '';
  }
}