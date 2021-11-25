import App from "./App";
import { DataProvider } from "./data";
import { ABORT_DELAY, API_DELAY } from "./delays";
import {
  renderToPipeableStream,
} from "react-dom/cjs/react-dom-server.node.development";

/**
 * Streaming SSR in a Node.js runtime
 */
export function renderInNode({ res, head }) {
  const data = createServerData();

  res.socket.on("error", (error) => {
    console.error("Fatal", error);
  });
  let didError = false;

  const { pipe, abort } = renderToPipeableStream(
    <DataProvider data={data}>
      <App head={head} />
    </DataProvider>,
    {
      onCompleteShell() {
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onError(x) {
        didError = true;
        console.error(x);
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
export function renderInWorkers({ head }) {
  const data = createServerData();

  const proxy = {
    write(chunk) {
      this.controller.enqueue(chunk);
      // no backpressure support yet...
      return true;
    },
    end() {
      this.controller.close();
    },
    destroy(err) {
      this.controller.error(err);
    },
    on() {}
  };

  let didError = false;
  try {
    const {pipe, abort} = renderToPipeableStream(
        <DataProvider data={data}>
          <App head={head} />
        </DataProvider>,
        {
          onCompleteShell() {
            pipe(proxy);
          },
          onError(x) {
            didError = true;
            console.error(x);
          },
        }
    );
    proxy.abort = (reason) => {
      console.error("Proxy aborted:", reason);
      abort();
    }
  } catch(e) {
    console.error("renderToPipeableStream failed:", e);
  }

  if (didError) {
    throw new Error("renderToPipeableStream failed right after start");
  }

  const stream = new ReadableStream({
    start: function (controller) {
      proxy.controller = controller;
    },
    cancel: function(reason) {
      proxy.abort(reason);
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/html",
    },
  });
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
