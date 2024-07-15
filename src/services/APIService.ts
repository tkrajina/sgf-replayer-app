import { Observable } from "../utils/observable";

export const API_URL = `${document.location.protocol}//${document.location.host}/api`;

export class APIError extends Error {

  constructor(public readonly httpCode: number, internalMsg: string, public readonly userMsg: string) {
    super(internalMsg);
  }

  static getUserMessage(e: any) {
    return (e as APIError)?.userMsg || e?.message || `Unknown error: ${e}`;
  }
}

export class APIService {

  public loggedIn = new Observable<boolean>(false);

  constructor() {
    setTimeout(this.checkLoggedIn.bind(this), 500);
    setInterval(this.checkLoggedIn.bind(this), 30 * 1000);
  }

  private async checkLoggedIn() {
    try {
      const jsn = await API_SERVICE.doGET("/status");
      this.loggedIn.set(jsn?.logged);
    } catch (e) {
      this.loggedIn.set(false);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  public async doGET(path: string, params: { [name: string]: string | number | string[] | number[] } = {}) {
    let queryString = "";
    if (params) {
      const pairs: string[] = [];
      for (const key in params) {
        if ("object" == typeof params[key] && (params[key] as any).slice) {
          // If list => multiple query params with same name
          for (const val of params[key] as any[]) {
            pairs.push(`${key}=${val}`);
          }
        } else {
          pairs.push(`${key}=${params[key]}`);
        }
      }
      if (queryString) {
        queryString += "&";
      }
      queryString += pairs.join("&");
    }
    return await this.fetchJSONAsync(path + "?" + queryString, {
      method: "get",
    });
  }

  public async doPOST(path: string, body: any, bodyType: "form" | "json" = "json") {
    let data: any;
    let contentType: string = "";
    if (bodyType === "form") {
      if (body instanceof FormData) {
        data = body;
      } else {
        data = new FormData();
        if (body) {
          for (const key in body) {
            data.append(key, body[key]);
          }
        }
      }
    } else {
      data = JSON.stringify(body);
      contentType = "application/json";
    }
    const headers: { [_: string]: string } = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return await this.fetchJSONAsync(path, {
      method: "post",
      body: data,
      headers: headers,
    });
  }

  public async doDELETE(path: string) {
    return await this.fetchJSONAsync(path, {
      method: "DELETE",
    });
  }

  private async fetchJSONAsync(path: string, info: RequestInit) {
    const url = API_URL + path;
    console.debug(`${info.method} ${url}`);
    if (!info) {
      info = {};
    }
    info.credentials = "include";
    if (!info.headers) {
      info.headers = {};
    }
    console.debug(`Req ${url} with headers ${info.headers}`);

    (info.headers as any)["Accept"] = "application/json";

    try {
      const response = await fetch(url, info);
      console.debug(`Resp ${response.status} from ${info.method} ${url}`);
      if ((200 <= response.status && response.status < 300) || response.status === 304 /* not modified */) {
        if (response.status === 204 /* no content */) {
          return null;
        }
        return await response.json();
      } else {
        let jsn = null;
        try {
          jsn = await response.json();
        } catch (error) {
          console.error(error);
        }
        throw new APIError(response.status, response.statusText, jsn?.error || response.statusText || `Error ${response.status}`);
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.debug(`error ${error} from ${info.method} ${url}`);
      console.error(error);
      throw new APIError(0, "" + error, "Error calling API");
    }
  }
}

export const API_SERVICE = new APIService();