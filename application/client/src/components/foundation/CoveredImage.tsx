import { load, ImageIFD } from "piexifjs";
import { MouseEvent, useCallback, useId, useState } from "react";

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { Modal } from "@web-speed-hackathon-2026/client/src/components/modal/Modal";
import { fetchBinary } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface Props {
  src: string;
}

/**
 * アスペクト比を維持したまま、要素のコンテンツボックス全体を埋めるように画像を拡大縮小します
 */
export const CoveredImage = ({ src }: Props) => {
  const dialogId = useId();
  // ダイアログの背景をクリックしたときに投稿詳細ページに遷移しないようにする
  const handleDialogClick = useCallback((ev: MouseEvent<HTMLDialogElement>) => {
    ev.stopPropagation();
  }, []);

  const [alt, setAlt] = useState<string | null>(null);
  const [isLoadingAlt, setIsLoadingAlt] = useState(false);

  const loadAltText = useCallback(async () => {
    if (alt !== null) return;
    
    setIsLoadingAlt(true);
    try {
      const data = await fetchBinary(src);
      if (data) {
        const exif = load(Buffer.from(data).toString("binary"));
        const raw = exif?.["0th"]?.[ImageIFD.ImageDescription];
        const text = raw != null ? new TextDecoder().decode(Buffer.from(raw, "binary")) : "説明はありません";
        setAlt(text);
      } else {
        setAlt("説明はありません");
      }
    } catch (e) {
      setAlt("読み込みに失敗しました");
    } finally {
      setIsLoadingAlt(false);
    }
  }, [src, alt]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-cax-surface-subtle">
      <img
        alt="投稿画像"
        loading="lazy"
        decoding="async"
        className="absolute left-1/2 top-1/2 h-full w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        src={src}
      />

      <button
        className="border-cax-border bg-cax-surface-raised/90 text-cax-text-muted hover:bg-cax-surface absolute right-1 bottom-1 z-10 rounded-full border px-2 py-1 text-center text-xs"
        type="button"
        command="show-modal"
        commandfor={dialogId}
        onClick={(e) => {
          e.stopPropagation();
          void loadAltText();
        }}
      >
        {isLoadingAlt ? "読み込み中..." : "ALT を表示する"}
      </button>

      <Modal id={dialogId} closedby="any" onClick={handleDialogClick}>
        <div className="grid gap-y-6">
          <h1 className="text-center text-2xl font-bold">画像の説明</h1>

          <p className="text-sm">{alt ?? "..."}</p>

          <Button variant="secondary" command="close" commandfor={dialogId}>
            閉じる
          </Button>
        </div>
      </Modal>
    </div>
  );
};
