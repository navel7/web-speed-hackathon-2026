import { loadFFmpeg } from "@web-speed-hackathon-2026/client/src/utils/load_ffmpeg";

interface Options {
  extension: string;
  size?: number | undefined;
}

/**
 * 先頭 5 秒のみ、正方形にくり抜かれた無音動画（超軽量MP4）を作成します
 */
export async function convertMovie(file: File, options: Options): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  // 元のサイズをさらに小さくするために scale を調整
  // options.size が指定されていない場合は、元のサイズの半分にする設定
  const cropOptions = [
    "'min(iw,ih)':'min(iw,ih)'",
    options.size ? `scale=${options.size}:${options.size}` : "scale='iw/2':'ih/2'",
  ]
    .filter(Boolean)
    .join(",");
  
  const exportFile = `export.${options.extension}`;

  await ffmpeg.writeFile("input", new Uint8Array(await file.arrayBuffer()));

  await ffmpeg.exec([
    "-i", "input",
    "-t", "5",                  // 5秒間
    "-vf", `${cropOptions},fps=15`, // 正方形にクロップ、サイズダウン、フレームレート抑制
    "-c:v", "libx264",          // H.264
    "-crf", "32",               // 高圧縮（画質を適度に落とす）
    "-preset", "faster",        // 変換速度優先
    "-pix_fmt", "yuv420p",      // 再生互換性
    "-an",                      // 無音化
    "-movflags", "faststart",   // 即時再生最適化
    exportFile,
  ]);

  const output = (await ffmpeg.readFile(exportFile)) as Uint8Array<ArrayBuffer>;

  ffmpeg.terminate();

  return new Blob([output], { type: "video/mp4" });
}
