import classNames from "classnames";
import { useCallback, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";

interface Props {
  src: string;
  aspectWidth?: number;
  aspectHeight?: number;
}

/**
 * クリックすると再生・一時停止を切り替えます。
 */
export const PausableMovie = ({ src, aspectWidth = 1, aspectHeight = 1 }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleClick = useCallback(() => {
    setIsPlaying((playing) => {
      if (playing) {
        videoRef.current?.pause();
      } else {
        void videoRef.current?.play();
      }
      return !playing;
    });
  }, []);

  return (
    <AspectRatioBox aspectHeight={aspectHeight} aspectWidth={aspectWidth}>
      <button
        aria-label="動画プレイヤー"
        className="group relative block h-full w-full overflow-hidden bg-cax-surface-subtle"
        onClick={handleClick}
        type="button"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          src={src}
        />
        <div
          className={classNames(
            "absolute left-1/2 top-1/2 flex items-center justify-center w-16 h-16 text-cax-surface-raised text-3xl bg-cax-overlay/50 rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity",
            {
              "opacity-0 group-hover:opacity-100": isPlaying,
            },
          )}
        >
          <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
        </div>
      </button>
    </AspectRatioBox>
  );
};
