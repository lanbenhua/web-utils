export const mix = (uri: string): string => {
  return `${window.location.origin}/${
    uri.startsWith('/') ? uri.slice(1) : uri
  }`;
};

export type LinkTargetWindowName = string;
export type LinkTargetType = '_blank' | '_self' | '_parent' | '_top';
export type LinkTarget = LinkTargetType | LinkTargetWindowName;
export type LinkParams =
  | Record<string, string | number | undefined | null | string[] | number[]>
  | string
  | null;

export const linkTo = (
  uri: string,
  params?: LinkParams,
  targrt: LinkTarget = '_blank'
): Window | null => {
  const url = getLink(uri, params);

  if (window.open && typeof window.open === 'function')
    return window.open(url.toString(), targrt);

  dispatchLink(url, targrt as LinkTargetType);
  return null;
};

export const getLink = (uri: string, params?: LinkParams): string => {
  const url = new URL(uri, window.location.href);
  if (typeof params === 'string') {
    url.search = params.startsWith('?') ? params : '?' + params;
  } else if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => url.searchParams.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

export const dispatchLink = (url: string, targrt: LinkTargetType) => {
  const a = document.createElement('a');
  a.setAttribute('href', url.toString());
  a.setAttribute('target', targrt);
  const e = document.createEvent('MouseEvents');
  e.initEvent('click', false, true);
  a.dispatchEvent(e);
};
