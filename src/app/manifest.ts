import type { MetadataRoute } from "next";
import { basePath } from "@/lib/base-path";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${basePath}/`,
    name: "等等再买",
    short_name: "等等再买",
    description: "和朋友一起，给冲动一个冷静期",
    start_url: `${basePath}/login/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f7f4ec",
    theme_color: "#41644a",
    categories: ["lifestyle", "finance"],
    icons: [
      { src: `${basePath}/icon`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${basePath}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
