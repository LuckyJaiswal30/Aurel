import { expect, test } from "vitest";
import { detectProfilePhoto } from "./detect-profile-photo";

const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56,
  0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00,
]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const png = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

test("accepts the WebP and JPEG photos the resizer makes", async () => {
  expect(await detectProfilePhoto(webp)).toEqual({
    extension: "webp",
    mimeType: "image/webp",
  });
  expect((await detectProfilePhoto(jpeg))?.extension).toBe("jpg");
});

test("refuses other files, even other images", async () => {
  expect(await detectProfilePhoto(png)).toBeNull();
  expect(
    await detectProfilePhoto(new TextEncoder().encode("<svg>")),
  ).toBeNull();
});
