import type { MetadataRoute } from "next";

// Web app manifest (task 26). `display: standalone` makes it launch fullscreen
// from the iPad home screen — no Safari chrome — which is the headline win for
// handing the iPad to a child. Next auto-links this at /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OLA English Adventure",
    short_name: "OLA English",
    description: "A sticker-collecting English game for children aged 4–7.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF7ED", // cream — matches the page so there's no flash
    theme_color: "#FF6B5E", // coral
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
