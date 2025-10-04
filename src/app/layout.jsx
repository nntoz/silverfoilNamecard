import "@/styles/globals.scss";
import { settings } from "./settings.js";
import Script from "next/script";

const siteName = settings.meta.siteName;
const description = settings.meta.description;
const url = settings.meta.url;

export const metadata = {
  //metadataBase: new URL(url), //dir指定のlocalhost対策、npm run devだと動かないのでアップロード時にコメントアウトを外す
  title: siteName,
  description: description,
  openGraph: {
    //OGP
    title: siteName,
    description: description,
    url: url,
    siteName: siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: description,
  },
  alternates: {
    //おまじない
    canonial: "/",
  },
  //[task] next.jsだとmetaでファビコン設定ができないので以下を参考にappに入れる
  //apple-icon.png
  //icon.ico
  //opengraph-image.png
};

//component
import LayoutBody from "@/components/common/layoutBody.jsx";

//function
// import LenisProvider from "@/components/functions/lenisProvider.jsx";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
      </head>
      <body>
        <LayoutBody>{children}</LayoutBody>
      </body>
    </html>
  );
}
