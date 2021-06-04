const express = require('express');
const session = require('express-session');
const path = require('path');
const proxy = require('express-http-proxy');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const nocache = require('nocache');
const useragent = require('express-useragent');

const MemcachedStore = require("connect-memcached")(session);
const {verifyToken, simpleVerify} = require('./controllers/local_auth');
const status = require('./controllers/status');
const {exportNotebook, zipExportedNotebook, returnNotebook} = require('./controllers/export_notebook');

const app = express();
const env = app.get('env');
const configFile = process.argv[2] || `../config/config.${[env]}.json`;
const config = require(configFile);

app.use(logger(config.morgan));
app.use(nocache());
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('trust proxy', 1);
app.use(cors());

app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  store: new MemcachedStore({
    hosts: [config.session.server]
  }),
  cookie: {
    maxAge: config.session.expiry * 60 * 60 * 1000
  }
}));

app.get('/status', verifyToken, async (req, res) => {
  try {
    const authorized = await simpleVerify(config.api, req.token);
    if (authorized) {
      const check = await status.check();
      res.status(200).json(check);
    } else {
      res.status(403).json({error: 'incorrect token, not authorized'});
    }
  } catch (e) {
    res.status(500).json({error: e});
  }
});

app.post('/exportNotebook', verifyToken, async (req, res) => {
  try {
    const authorized = await simpleVerify(config.api, req.token);
    if (authorized) {
      const uid = req.body.uid;
      const nbid = req.body.nbid;
      if (uid && nbid) {
        const exported = await exportNotebook(config, uid, nbid);
        res.status(200).json({notebookId: exported.outputDirectoryName});
      } else {
        res.status(403).json({error: 'include uid and nbid'});
      }
    } else {
      res.status(403).json({error: 'incorrect token, not authorized'});
    }
  } catch (e) {
    res.status(500).json({error: e});
  }
});

app.post('/zipNotebook', verifyToken, async (req, res) => {
  try {
    const authorized = await simpleVerify(config.api, req.token);
    if (authorized) {
      const notebookId = req.body.notebookId;
      if (notebookId) {
        const notebook = zipExportedNotebook(config, notebookId);
        if (notebook.exists) {
          res.status(200).json({message: 'zip started'});
        } else {
          res.status(404).json({error: 'notebook not found'});
        }
      } else {
        res.status(403).json({error: 'incorrect token, not authorized'});
      }
    } else {
      res.status(403).json({error: 'incorrect token, not authorized'});
    }
  } catch (e) {
    res.status(500).json({error: e});
  }
})

app.post('/returnNotebook', verifyToken, async (req, res) => {
  try {
    const authorized = await simpleVerify(config.api, req.token);
    if (authorized) {
      const notebookId = req.body.notebookId;
      if (notebookId) {
        const notebook = await returnNotebook(config, notebookId);
        if (notebook.exists) {
          res.status(200).download(notebook.filePath, notebook.fileName);
        } else {
          res.status(404).json({error: 'notebook not found'});
        }
      } else {
        res.status(403).json({error: 'incorrect token, not authorized'});
      }
    } else {
      res.status(403).json({error: 'incorrect token, not authorized'});
    }
  } catch (e) {
    res.status(500).json({error: e});
  }
});

module.exports = app;
