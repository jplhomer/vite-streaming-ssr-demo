/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Tweak these to play with different kinds of latency.

// How long the data fetches on the server.
export const API_DELAY = 2000;

// How long the server waits for data before giving up.
export const ABORT_DELAY = 10000;

// DIRTY DIRTY way to polyfill some missing globals in miniflare
// There is a better way: https://miniflare.dev/api.html#arbitrary-bindings
globalThis.setImmediate = globalThis.setImmediate || ((fn) => setTimeout(fn, 0));
// We have this in Oxygen and can expose it
globalThis.Buffer = globalThis.Buffer || {
    td: new TextEncoder(),
    from: function(chunk) {
        return this.td.encode(chunk);
    }
};
// end dirty stuff
