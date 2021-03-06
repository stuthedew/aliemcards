/* eslint-disable global-require */
const express = require('express');
const graphqlHTTP = require('express-graphql');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const compression = require('compression');
const { join } = require('path');
const { post } = require('axios');

const data = require('./server/data.json');
const { schema } = require('./server/schema');

const isDevelopment = process.env.NODE_ENV !== 'production';
const app = express();
const jsonParser = bodyParser.json();

app.use(compression({ threshold: 0 }));
app.use(helmet());

if (isDevelopment) {
  const webpack = require('webpack');
  const config = require('./webpack.config');
  const compiler = webpack(config);
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true,
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}

app.use(express.static(join(__dirname, 'dist'), { maxAge: 31557600000 })); // 1 year

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: isDevelopment,
  context: data,
}));

app.post('/contact', jsonParser, (req, res) => {
  post('https://aliem-slackbot.now.sh/aliemcards/messages/contact-form', req.body, {
    headers: {
      ALIEM_API_KEY: process.env.ALIEM_API_KEY,
    },
  })
  .then(() => res.sendStatus(200))
  .catch(e => res.status(502).send(e.message));
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'), { maxAge: 31557600000 }); // 1 year
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening.');
});
