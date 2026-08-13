const photoSize = 256;

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.85),
  );
}

export async function makeProfilePhoto(file: File): Promise<Blob> {
  const image = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const side = Math.min(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = photoSize;
  canvas.height = photoSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(
    image,
    (image.width - side) / 2,
    (image.height - side) / 2,
    side,
    side,
    0,
    0,
    photoSize,
    photoSize,
  );
  image.close();
  const webp = await canvasToBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await canvasToBlob(canvas, "image/jpeg");
  if (!jpeg) throw new Error("Could not encode the photo");
  return jpeg;
}
