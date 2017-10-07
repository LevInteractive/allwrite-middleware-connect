const url = require("url");
const adapters = {
  "http:": require("http"),
  "https:": require("https"),
};

/**
 * Allwrite Middleware for Connect (and Express).
 *
 * Basic usage:
 *
 *   .use(allwrite("https://my-allwrite-server.com", "/docs"))
 *
 *   - or -
 *
 *   app.get("/docs/:slug", allwrite("http://...", "/docs"), myrouter)
 *
 * The `req.allwriteData` property will be set with the content corresponding
 * to the slug of the url.
 *
 *   {
 *     code: 200 | 400,
 *     result: {...}
 *   }
 *
 * @param {string} apiUrl The full url to the Allwite API.
 * @param {string} root   The base uri the applications start at. This should
 *                        have a trailing and leading slash.
 */
module.exports = function allwrite(apiUrl, root) {
  const get = adapters[ url.parse(apiUrl).protocol ].get;
  const leadOrTrail = /^\/*|\/*$/g;

  // Normalize all paths to be without slashes for sanity.
  root = root ? root.replace(leadOrTrail, "") : "";
  apiUrl = apiUrl ? apiUrl.replace(leadOrTrail, "") : "";

  return function(req, res, next) {
    const uri = req.originalUrl
      .replace(leadOrTrail, "")
      .replace(
        new RegExp("^" + root.replace("/", "\\/")),
        ""
      )
      .replace(leadOrTrail, "");

    console.log("URI", uri);

    get(apiUrl + "/" + uri, function(res) {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
      let rawData = '';

      // If it's not a 200 and not a 404 there's another issue. Allwrite will
      // only return these two statuses.
      if (statusCode !== 200 && statusCode !== 404) {
        const error = new Error('Allwrite: Request Failed.\n' +
                                `Status Code: ${statusCode}`);
        error.code = statusCode;
        return next(error);
      } else if (!/^application\/json/.test(contentType)) {
        const error = new Error('Allwrite: Invalid content-type.\n' +
                          `Expected application/json but got ${contentType}`);
        return next(error);
      }

      res.setEncoding("utf8");
      res.on("data", function(chunk) {
        rawData += chunk;
      });
      res.on("end", function() {
        try {
          req.allwriteData = JSON.parse(rawData);
          next();
        } catch (e) {
          next(new Error("Allwrite response parsing error: " + e.message));
        }
      });
    });
  };
};
