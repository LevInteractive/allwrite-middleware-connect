# allwrite-middleware-connect

Zero dependency Connect & Express middleware for enabling SEO friendly
documentation when using [Allwrite Docs](https://github.com/LevInteractive/allwrite-docs).

**In a nutshell:**

To have the speed of a single page application, and the SEO of a traditional
application, you must render the content on the server first and display it on
page load. This middleware will grab the content from your allwrite server and pass
it to `req.allwriteData` for you to display in your view for crawlers.

When using a theme like
[Spartan](https://github.com/LevInteractive/spartan-allwrite), the content will
be unseen to the javascript-capable humans and only parsable for crawlers.

# Installation

```
npm i --save allwrite-middleware-connect
```

# Usage

#### `allwrite(apiURL, baseURI)`

**Parameters**

* `apiURL`: Required. This should be the remote path to your server running allwrite.
* `baseURI`: Optional. If you are serving docs at say, `/my/docs`, then your baseURI will be `/my/docs`. If left blank, the base "/" is assumed.

Controller:

```javascript
const allwrite = require("allwrite-middleware-connect");

app.get(
  "/docs/:slug",
  allwrite("http://allwrite-server", "/docs"),
  handler
);

// Your typical express/connect router
function handler(req, res, next) {

  // code will equal 404 when the slug doesn't exist.
  if (req.allwriteData.code === 404) {
    return next(new Error("Page not found"));
  }

  // Pass in the title and content to your template. This could obviously be
  // EJS, jade, mustache, etc.
  //
  // console.log(req.allwriteData.result); // Will be an entire page object.
  //
  res.render("/docs", {
    title: req.allwriteData.result.name,
    content: req.allwriteData.result.html,
  });
}
```

View:

```html
<div
  id="allwrite-docs"
  class="allwrite-docs"
  data-root="/docs"
  data-api="http://localhost:8000">
  <%= content %>
</div>
```
