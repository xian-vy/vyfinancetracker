const { injectManifest } = require("workbox-build");
const config = require("./workbox-config.js");

injectManifest(config).then(({ count, size }) => {
  console.log(`Generated service worker, precaching ${count} files, ${size} bytes.`);
});
