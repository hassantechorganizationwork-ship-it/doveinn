import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// A gold "D" monogram on the brand's dark background — legible even at
// 16x16 in a browser tab, unlike a detailed dove illustration would be.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C1C1C",
          borderRadius: "6px",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#C9A84C",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>
    ),
    { ...size }
  );
}
