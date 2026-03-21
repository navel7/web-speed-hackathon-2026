export async function loadFFmpeg(): Promise<any> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();

  const { default: coreUrl } = await import("@ffmpeg/core?binary");
  const { default: wasmUrl } = await import("@ffmpeg/core/wasm?binary");

  await ffmpeg.load({
    coreURL: coreUrl as unknown as string,
    wasmURL: wasmUrl as unknown as string,
  });

  return ffmpeg;
}
