const { MongoClient } = require("mongodb");
require("dotenv").config();

// The module export database itself instead of a function.
// We run the function as IIFE and then store it returned value as a Promise.
// we can use Promise<Db> when we need using async-await or db.then mechanism
module.exports = (async () => {
  const client = new MongoClient(process.env.MONGODBURI || "mongodb://localhost:27017/issuetracker",
    { useNewUrlParser: true });
  await client.connect();
  console.log("Connection to Mongo Database is successfull!");
  const issuesDb = client.db();
  return issuesDb;
})();
