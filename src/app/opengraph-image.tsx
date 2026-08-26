import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph / Twitter card (1200×630). Rendered at build time from
 * the same positioning as the homepage hero — one source of truth for the
 * entity description that social platforms and messengers display.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AutoMSP — managed AI systems for mid-market companies";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#110F0E",
          color: "#F5F2ED",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#F5F2ED",
              borderRadius: 8,
            }}
          />
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", opacity: 0.9 }}>
            AutoMSP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700, maxWidth: 900 }}>
            Build an AI operating layer without building an AI department.
          </div>
          <div style={{ fontSize: 28, opacity: 0.7 }}>
            AI infrastructure · workflow automation · production agents · managed operations
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, opacity: 0.6 }}>
          <div>automsp.cloud</div>
          <div>Book a free AI opportunity audit</div>
        </div>
      </div>
    ),
    size,
  );
}
