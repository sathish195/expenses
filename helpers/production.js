const helmet = require('helmet'); // to provide security for https headers
const compression = require('compression');// it compress the req.body 
const rateLimit = require('express-rate-limit');
const cors = require('cors'); // to provide access to all or only particular origin
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
module.exports = (app) => {
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(limiter);
};
