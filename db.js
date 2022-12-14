const {
  MongoClient
} = require('mongodb');
let dbConnetion;
let uri = 'mongodb+srv://<username>:<pwd>@cluster0.epiedne.mongodb.net/?retryWrites=true&w=majority';
module.exports = {
  connectTODB(cb) {
    MongoClient.connect(uri).then((client) => {
      dbConnetion = client.db();
      return cb();
    }).catch((err) => {
      console.error(err);
      return cb(err);
    });
  },
  getDB: () => dbConnetion
}
