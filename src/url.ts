export type RouteQuery = {
  [key: string]: string[] | string | number[] | number | null | undefined;
};

export type RouteParams = Record<string, string | number | null | undefined>;

import { isNil } from "./nil";

export const search2Params = <T extends RouteQuery = RouteQuery>(
  search: string
): T => {
  const searchParams = new URLSearchParams(search);
  const params: RouteQuery = {};
  searchParams.forEach((_, key) => {
    const value = searchParams.getAll(key);
    if (value.length > 1 || key.match(/\[\]$/)) {
      params[key] = value;
    } else if (value.length === 1) {
      params[key] = value[0];
    }
  });
  return params as T;
};

export const params2Search = <T extends RouteQuery = RouteQuery>(
  params?: T | null
): string => {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const key in params) {
    const val = params[key];
    if (isNil(val)) continue;
    if (Array.isArray(val)) {
      val.forEach((v: string | number) => {
        searchParams.append(key, String(v));
      });
      continue;
    }
    if (typeof val === "string") {
      searchParams.append(key, val);
      continue;
    }
    if (typeof val === "number") {
      searchParams.append(key, String(val));
      continue;
    }
    if (val && typeof (val as String).toString === "function") {
      searchParams.append(key, (val as String).toString());
      continue;
    }
    continue;
  }
  return searchParams.toString();
};

export const mergeParams = <T extends RouteQuery = RouteQuery>(
  params1?: string | RouteQuery,
  params2?: string | RouteQuery
): T => {
  const searchParams1 =
    typeof params1 === "string"
      ? new URLSearchParams(params1)
      : new URLSearchParams(params2Search(params1));
  const searchParams2 =
    typeof params2 === "string"
      ? new URLSearchParams(params2)
      : new URLSearchParams(params2Search(params2));

  const searchParams = new URLSearchParams();
  searchParams1.forEach((val, key) => {
    searchParams.append(key, val);
  });
  searchParams2.forEach((val, key) => {
    searchParams.append(key, val);
  });
  return search2Params(searchParams.toString());
};

export const replaceDynamicParams = (
  path: string,
  params?: RouteParams,
  replacer?: (seg: string) => string
): string => {
  if (!params) return path;
  if (!replacer) replacer = (seg) => encodeURIComponent(seg);

  for (const key in params) {
    if (key) {
      const pathSeg =
        params[key] === null || params[key] === undefined
          ? ""
          : replacer
          ? replacer(String(params[key]))
          : String(params[key]);
      path = path.replace(new RegExp(`:${key}`), pathSeg);
    }
  }
  return path;
};

class URI {
  private _uri: string;

  public get uri(): string {
    return this._uri;
  }

  constructor(uri: string) {
    if (uri === undefined || uri === null)
      throw new Error("[URI] uri must not be null");
    this._uri = uri;
  }

  public prune(): string | null {
    return prune_uri(this._uri);
  }

  public valid(): boolean {
    return !!this.prune();
  }

  public isHttp(): boolean {
    return !!is_web_iri(this._uri);
  }

  public isHttps(): boolean {
    return !!is_https_iri(this._uri);
  }
}

export { URI };

// private function
// internal URI spitter method - direct from RFC 3986
export const splitUri = function (uri: string): RegExpMatchArray | null {
  const splitted = uri.match(
    /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/
  );
  return splitted;
};

export function prune_uri(uri: string): string | null {
  if (!uri) return null;

  // check for illegal characters
  if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(uri))
    return null;

  // check for hex escapes that aren't complete
  if (/%[^0-9a-f]/i.test(uri)) return null;

  if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(uri)) return null;

  // from RFC 3986
  const splitted = splitUri(uri);
  const scheme = splitted?.[1];
  const authority = splitted?.[2];
  const path = splitted?.[3];
  const query = splitted?.[4];
  const fragment = splitted?.[5];

  let out = "";

  // scheme and path are required, though the path can be empty
  if (!(scheme && scheme.length && path && path.length >= 0)) return null;

  // if authority is present, the path must be empty or begin with a /
  if (authority && authority.length) {
    if (!(path.length === 0 || /^\//.test(path))) return null;
  } else {
    // if authority is not present, the path must not start with //
    if (/^\/\//.test(path)) return null;
  }

  // scheme must begin with a letter, then consist of letters, digits, +, ., or -
  if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase())) return null;

  // re-assemble the URL per section 5.3 in RFC 3986
  out += scheme + ":";
  if (authority && authority.length) {
    out += "//" + authority;
  }

  out += path;

  if (query && query.length) {
    out += "?" + query;
  }

  if (fragment && fragment.length) {
    out += "#" + fragment;
  }

  return out;
}

function prune_http_uri(value: string, allowHttps?: boolean): string | null {
  if (!prune_uri(value)) return null;

  // from RFC 3986
  const splitted = splitUri(value);
  const scheme = splitted?.[1];
  let authority = splitted?.[2];
  const path = splitted?.[3];
  let port = undefined;
  const query = splitted?.[4];
  const fragment = splitted?.[5];
  let out = "";

  if (!scheme) return null;

  if (allowHttps) {
    if (scheme.toLowerCase() != "https") return null;
  } else {
    if (scheme.toLowerCase() != "http") return null;
  }

  // fully-qualified URIs must have an authority section that is
  // a valid host
  if (!authority) return null;

  // enable port component
  if (/:(\d+)$/.test(authority)) {
    port = authority?.match(/:(\d+)$/)?.[0];
    authority = authority.replace(/:\d+$/, "");
  }

  out += scheme + ":";
  out += "//" + authority;

  if (port) {
    out += port;
  }

  out += path;

  if (query && query.length) {
    out += "?" + query;
  }

  if (fragment && fragment.length) {
    out += "#" + fragment;
  }

  return out;
}

export function is_https_iri(uri: string): boolean {
  return !!prune_http_uri(uri, true);
}

export function is_web_iri(uri: string): boolean {
  return !!(prune_http_uri(uri) || is_https_iri(uri));
}
