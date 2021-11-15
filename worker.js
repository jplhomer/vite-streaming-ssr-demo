import { renderInWorkers } from "./src/entry-server";
import template from "./dist/client/index.html?raw";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

async function assetHandler(event, url) {
  const response = await getAssetFromKV(event, {});

  if (response.status < 400) {
    const filename = url.pathname.split("/").pop();

    const maxAge =
      filename.split(".").length > 2
        ? 31536000 // hashed asset, will never be updated
        : 86400; // favico and other public assets

    response.headers.append("cache-control", `public, max-age=${maxAge}`);
  }

  return response;
}

/**
 * Scrape out `head` contents injected by Vite. This is used for React runtime and fast refresh.
 * It will be injected into the `<Html>` React component shell in the server entrypoint.
 */
const head = template.match(/<head>(.+?)<\/head>/s)[1];

addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (/(ico|css|js|svg)$/.test(url.pathname)) {
    return event.respondWith(assetHandler(event, url));
  }

  try {
    event.respondWith(renderInWorkers({ head }));
  } catch (error) {
    return new Response(event.message, {
      status: 500,
    });
  }
});
