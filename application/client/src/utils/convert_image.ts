let isInitialized = false;

export async function convertImage(file: File, options: { extension: any }): Promise<Blob> {
  const { initializeImageMagick, ImageMagick } = await import("@imagemagick/magick-wasm");
  
  if (!isInitialized) {
    const { default: wasmUrl } = await import("@imagemagick/magick-wasm/magick.wasm?binary");
    const response = await fetch(wasmUrl as unknown as string);
    const wasmBytes = new Uint8Array(await response.arrayBuffer());
    
    await initializeImageMagick(wasmBytes);
    isInitialized = true;
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return await new Promise((resolve) => {
    ImageMagick.read(uint8Array, (image) => {
      image.write(options.extension, (data) => {
        resolve(new Blob([data], { type: "image/jpeg" }));
      });
    });
  });
}
