import { extractMetadataFromSound } from "@web-speed-hackathon-2026/client/src/utils/extract_metadata_from_sound";
import { loadFFmpeg } from "@web-speed-hackathon-2026/client/src/utils/load_ffmpeg";

interface Options {
  extension: string;
}

/**
 * 音声ファイルを指定の形式（超軽量）に変換します
 */
export async function convertSound(file: File, options: Options): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  const exportFile = `export.${options.extension}`;

  await ffmpeg.writeFile("file", new Uint8Array(await file.arrayBuffer()));

  // 文字化けを防ぐためにメタデータを抽出して付与し直す
  const metadata = await extractMetadataFromSound(file);

  await ffmpeg.exec([
    "-i", "file",
    "-metadata", `artist=${metadata.artist}`,
    "-metadata", `title=${metadata.title}`,
    "-vn",                      // 映像なし
    "-ab", "64k",               // 音声ビットレートを 64kbps に制限（軽量化）
    exportFile,
  ]);

  const output = (await ffmpeg.readFile(exportFile)) as Uint8Array<ArrayBuffer>;

  ffmpeg.terminate();

  return new Blob([output], { type: "audio/mpeg" });
}
