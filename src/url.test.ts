import { URI } from "./url";

describe("URI", () => {
  const uri = new URI(
    "http://abc.com/a/b/c?a=1&b=2&b=1 fhwe http://abc.com/a/b/c?a=1&b=2&b=1"
  );
  it("prune", () => {
    expect(uri.prune()).toEqual(null);
  });

  it("valid", () => {
    expect(uri.valid()).toEqual(false);
  });

  it("extractLink", () => {
    const out = uri.extractLink();
    expect(out).toEqual([
      "http://abc.com/a/b/c?a=1&b=2&b=1",
      "http://abc.com/a/b/c?a=1&b=2&b=1",
    ]);
  });

  it("splitLink", () => {
    const out = uri.splitLink();
    expect(out).toEqual(["", " fhwe ", ""]);
  });

  it("markLink", () => {
    const out = uri.markLink();
    expect(out).toEqual([
      { type: "link", text: "http://abc.com/a/b/c?a=1&b=2&b=1" },
      { type: "text", text: " fhwe " },
      { type: "link", text: "http://abc.com/a/b/c?a=1&b=2&b=1" },
    ]);
  });
});
