const { MongoClient, ObjectId } = require('mongodb');

const user = 'user';
const pass = 'passwd';
const db_url = 'mongo/cms';

const generateId = () => new ObjectId();

const client = new MongoClient(`mongodb://${user}:${pass}@${db_url}`, {
  useUnifiedTopology: true,
});

client
  .connect()
  .then(() => {
    console.log(`connected to database`);
  })
  .catch((e) => {
    console.error(e);
  });

module.exports = {
  client,
  generateId,
  ObjectId,
};
