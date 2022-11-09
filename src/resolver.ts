/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from "./nil";

const resolveNumber = (obj: any): number | undefined => {
  if (isNil(obj)) return undefined;
  if (obj === "") return undefined;
  const n = Number(obj);
  return isNaN(n) ? undefined : n;
};

const resolveString = (obj: any): string | undefined => {
  if (isNil(obj)) return undefined;
  if (
    typeof obj === "number" ||
    typeof obj === "string" ||
    typeof obj === "boolean"
  )
    return decodeURIComponent(String(obj));
  return undefined;
};

const resolveBool = (obj: any): boolean | undefined => {
  if (isNil(obj)) return undefined;
  if (obj === "") return undefined;
  if (
    typeof obj === "number" ||
    typeof obj === "string" ||
    typeof obj === "boolean"
  )
    return Boolean(Number(obj));
  return undefined;
};

const resolveArray = <T extends string | number | boolean>(
  obj: any,
  type: "number" | "string" | "boolean"
): T[] | undefined => {
  if (isNil(obj)) return undefined;
  if (obj === "") return undefined;
  if (Array.isArray(obj)) {
    return obj
      .map((cur) => {
        if (type === "string") return resolveString(cur);
        if (type === "number") return resolveNumber(cur);
        if (type === "boolean") return resolveBool(cur);
        return undefined;
      })
      .filter((cur) => !isNil(cur)) as T[];
  }
  if (type === "string")
    return [resolveString(obj)].filter((cur) => !isNil(cur)) as T[];
  if (type === "number")
    return [resolveNumber(obj)].filter((cur) => !isNil(cur)) as T[];
  if (type === "boolean")
    return [resolveBool(obj)].filter((cur) => !isNil(cur)) as T[];

  return undefined;
};

const resolver = <
  T extends string | number | boolean | (string | number | boolean)[]
>(
  obj: any,
  type: "number" | "string" | "boolean" | "array",
  arrayType?: "number" | "string" | "boolean"
): T | undefined => {
  if (isNil(obj)) return undefined;
  if (type === "array") {
    if (!arrayType)
      throw "If it is a array, you must pase a arrayType to resolver.";
    return resolveArray(obj, arrayType) as T;
  }
  if (type === "string") return resolveString(obj) as T;
  if (type === "number") return resolveNumber(obj) as T;
  if (type === "boolean") return resolveBool(obj) as T;
  return undefined;
};

export { resolveNumber, resolveString, resolveBool, resolveArray, resolver };
