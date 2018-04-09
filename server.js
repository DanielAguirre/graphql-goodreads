const express = require("express");
const util = require("util");
const graphqlHTTP = require("express-graphql");
const fetch = require("node-fetch");
const DataLoader = require("dataloader");
const schema = require("./schema");

const parseXML = util.promisify(require("xml2js").parseString);

const fetchAuthor = id =>
  fetch(
    `https://www.goodreads.com/author/show.xml?key=9tfNBHLV8r1Krj6kDx1nIA&id=${id}`
  )
    .then(response => response.text())
    .then(parseXML);

const fetchBook = id =>
  fetch(
    `https://www.goodreads.com/book/show/${id}.xml?key=9tfNBHLV8r1Krj6kDx1nIA`
  )
    .then(response => response.text())
    .then(parseXML);

const app = express();

app.use(
  "/graphql",
  graphqlHTTP(req => {
    const authoLoader = new DataLoader(keys =>
      Promise.all(keys.map(fetchAuthor))
    );
    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBook)));

    return {
      schema,
      context: {
        authoLoader,
        bookLoader
      },
      graphiql: true
    };
  })
);

app.listen(4000);
console.log("Listening....");
