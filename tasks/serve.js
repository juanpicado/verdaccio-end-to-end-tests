const express = require('express');
const serveStatic =  require('serve-static');

export const serve = async (location, port) => {
  return new Promise((resolve) => {
    const app = express();

    app.use(serveStatic(location));
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
};
