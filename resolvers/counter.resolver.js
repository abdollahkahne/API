const db = require("../infrastructure/db.server");

module.exports = {
  getNextSequenceItem: (type) => db.then((database) => database.collection("counters").findOneAndUpdate(
    { _id: type }, { $inc: { current: 1 } }, { returnOriginal: false },
  ))
    .then((counter) => counter.value.current),
};
