import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Currenzy — Currency Converter",
    short_name: "Currenzy",
    description: "Fast fiat and crypto conversion, even when you are offline.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6fa",
    theme_color: "#4f46e5",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
