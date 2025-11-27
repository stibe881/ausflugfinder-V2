/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-bf4e18d6'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "apple-touch-icon.png",
    "revision": "095b7c11eec3b2536f6130dad54faac8"
  }, {
    "url": "assets/index-5talctN-.css",
    "revision": null
  }, {
    "url": "assets/index-D-6lbBrA.js",
    "revision": null
  }, {
    "url": "assets/index.esm-Dcnl2ds4.js",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_celebrating.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_curious.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_eating.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_jumping.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_neutral.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_sleeping.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_thinking.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot_waving.png",
    "revision": null
  }, {
    "url": "assets/mascot/mascot-widget.css",
    "revision": null
  }, {
    "url": "assets/mascot/mascot-widget.js",
    "revision": null
  }, {
    "url": "assets/mascot/sounds.js",
    "revision": null
  }, {
    "url": "assets/mascot/test-integration.html",
    "revision": null
  }, {
    "url": "assets/workbox-window.prod.es5-CwtvwXb3.js",
    "revision": null
  }, {
    "url": "ausflugfinder-icon.svg",
    "revision": "5857b40ee1f3dfd6b10f6af4912a967b"
  }, {
    "url": "ausflugfinder-logo.svg",
    "revision": "a510d305f05d76b98aa6695dc1cd40fd"
  }, {
    "url": "favicon.png",
    "revision": "a61f65ea3f3fe2368ca9946c676a779d"
  }, {
    "url": "favicon.svg",
    "revision": "d52ed7d0423ac2cf2d3d7f56cf6cec0e"
  }, {
    "url": "hero-bg.jpg",
    "revision": "554a5a7f2caa7363b666e1f4646c33af"
  }, {
    "url": "icon-compass.png",
    "revision": "17882dd9da3208b4173be20987f9e64e"
  }, {
    "url": "icon-mountain.png",
    "revision": "095b7c11eec3b2536f6130dad54faac8"
  }, {
    "url": "icon-sun.png",
    "revision": "c2b6b11d046f446592af1f05aec5970c"
  }, {
    "url": "icons/cluster/cluster-large.png",
    "revision": "55b0a0f71e9f8362d58e8a0819e5a59f"
  }, {
    "url": "icons/cluster/cluster-medium.png",
    "revision": "8554dc3fe6d2534433e5e91ca1cd14c1"
  }, {
    "url": "icons/cluster/cluster-small.png",
    "revision": "d1cf5246feaea0cbd4d003100f6923e5"
  }, {
    "url": "index.html",
    "revision": "4f288351b592ba31a5c2a74a0b846273"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d84bdc2221a10c35c855bc5b62311f5a"
  }, {
    "url": "icons/cluster/cluster-large.png",
    "revision": "55b0a0f71e9f8362d58e8a0819e5a59f"
  }, {
    "url": "icons/cluster/cluster-medium.png",
    "revision": "8554dc3fe6d2534433e5e91ca1cd14c1"
  }, {
    "url": "icons/cluster/cluster-small.png",
    "revision": "d1cf5246feaea0cbd4d003100f6923e5"
  }, {
    "url": "manifest.webmanifest",
    "revision": "7a48d9049125d51e2a69fdad8687a20c"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//, /^\/trpc\//]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-static-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^\/api\/.*/i, new workbox.NetworkFirst({
    "cacheName": "api-cache",
    "networkTimeoutSeconds": 10,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 86400
    })]
  }), 'GET');

}));
