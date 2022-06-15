import App from "./App";
import { DataProvider } from "./data";
import { ABORT_DELAY, API_DELAY } from "./delays";
import {
  renderToPipeableStream,
  renderToReadableStream,
} from "react-dom/server";

/**
 * Streaming SSR in a Node.js runtime
 */
export function renderInNode({ res, head }) {
  const data = createServerData();

  res.socket.on("error", (error) => {
    console.error("Fatal", error);
  });

  const { pipe, abort } = renderToPipeableStream(
    <DataProvider data={data}>
      <App head={head} />
    </DataProvider>,
    {
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onErrorShell(x) {
        res.statusCode = 500;
        res.send(
          `<!doctype html><p>An error ocurred:</p><pre>${error.message}</pre>`
        );
      },
    }
  );

  // Abandon and switch to client rendering if enough time passes.
  // Try lowering this to see the client recover.
  setTimeout(abort, ABORT_DELAY);
}

/**
 * Stream a response in a Workers/v8 runtime
 */
export async function renderInWorkers({ head }) {
  const data = createServerData();

  try {
    const stream = await renderToReadableStream(
      <DataProvider data={data}>
        <App head={head} />
      </DataProvider>
    );

    return new Response(stream, {
      headers: {
        "content-type": "text/html",
      },
    });
  } catch (error) {
    return new Response(
      `<!doctype html><p>An error ocurred:</p><pre>${error.message}</pre>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

// Simulate a delay caused by data fetching.
// We fake this because the streaming HTML renderer
// is not yet integrated with real data fetching strategies.
function createServerData() {
  let done = false;
  let promise = null;
  return {
    read() {
      if (done) {
        return;
      }
      if (promise) {
        throw promise;
      }
      promise = new Promise((resolve) => {
        setTimeout(() => {
          done = true;
          promise = null;
          resolve();
        }, API_DELAY);
      });
      throw promise;
    },
  };
}
