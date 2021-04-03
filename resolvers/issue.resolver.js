/* eslint-disable no-underscore-dangle */
const { UserInputError } = require("apollo-server-express");
const db = require("../infrastructure/db.server");
const getId = require("./counter.resolver").getNextSequenceItem;
const { Utilities: { makeAuthenticatedResolver } } = require("../controllers/auth.controller");

const PAGE_SIZE = 6;

function issueValidate(issue) {
  const errors = [];
  const {
    // eslint-disable-next-line no-unused-vars
    title, owner, status, due, effort,
  } = issue;
  if (title.length < 10) {
    errors.push("Field 'Title' Must at least be 10 Chars");
  }
  if (status === "Assigned" && !owner) {
    errors.push("Field 'Owner' is Required when Status is Assigned");
  }
  if (errors.length) {
    throw new UserInputError("Invalid Inputs: ", { errors });
  }
}

function issueUpdateValidate(title, status, owner) {
  const errors = [];
  if (title && title.length < 10) {
    errors.push("Field 'Title' Must at least be 10 Chars");
  }
  if (status && status === "Assigned" && !owner) {
    errors.push("Field 'Owner' is Required when Status is Assigned");
  }
  if (errors.length) {
    throw new UserInputError("Invalid Inputs: ", { errors });
  }
}

// use async await version
// eslint-disable-next-line no-unused-vars
async function list(_, {
  status, effortMin, effortMax, q, page,
}) {
  const filter = status ? { status, deleted: { $ne: true } } : { deleted: { $ne: true } };
  if (effortMin !== undefined || effortMax !== undefined) {
    const effort = {};
    if (effortMin !== undefined) {
      effort.$gte = effortMin;
    }
    if (effortMax !== undefined) {
      effort.$lte = effortMax;
    }
    // Also include documents without effort value too
    // (in other case you can remove set filter.effort=effort)
    filter.$or = [{ effort }, { effort: { $exists: false } }];
  }
  if (q) {
    filter.$text = { $search: q };
  }
  const issuesQueryable = (await db)
    .collection("issues")
    .find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE);

  // false Here means that exclude limit and skip from query
  const totalCount = await issuesQueryable.count(false);
  const pages = Math.ceil(totalCount / PAGE_SIZE);

  const issuesEnumerable = await issuesQueryable.toArray();
  return { issues: issuesEnumerable, pages };
}
// use promise return with thenable promise
function create(_, { issue }) {
  issueValidate(issue);
  return db.then((database) => {
    const issueToAdd = issue;
    issueToAdd.createdAt = new Date();
    return getId("issues").then((nextId) => {
      issueToAdd.id = nextId;
      return database.collection("issues").insertOne(issueToAdd)
        .then((res) => database.collection("issues").findOne({ _id: res.insertedId }));
    });
  })
    .then((insetedIssue) => ({
      id: insetedIssue.id,
      success: true,
      message: "A new issue added to issue list",
    }));
}

function getIssue(_, { id }) {
  return db.then((database) => database.collection("issues").findOne({ id, deleted: { $ne: true } }))
    .then((issue) => issue);
}
function update(_, { id, updates }) {
  const { title, status, owner } = updates;
  issueUpdateValidate(title, status, owner);
  return db.then((database) => database.collection("issues")
    .updateOne({ id }, { $set: updates }, { returnOriginal: false })
  // eslint-disable-next-line no-unused-vars
    .then((_data) => database.collection("issues").findOne({ id, deleted: { $ne: true } })))
    .then((returnedData) => { console.log(returnedData); return ({ issue: returnedData, success: true, message: "Update was successfull!" }); });
}
// In case of delete we just add a boolean field showing delete status and deletion date!
function remove(_, { id }) {
  return db.then((database) => database.collection("issues")
    .updateOne({ id, deleted: { $ne: true } },
      { $set: { deleted: true, deletedAt: new Date() } }))
    .then((data) => {
      const { n, nModified } = data.result;
      if (nModified === 0 || n === 0) return false;
      return true;
    })
  // eslint-disable-next-line no-unused-vars
    .catch((_err) => false);
}
async function counts(_, { status, effortMin, effortMax }) {
  const filter = status ? { status, deleted: { $ne: true } } : { deleted: { $ne: true } };
  if (effortMin !== undefined || effortMax !== undefined) {
    const effort = {};
    if (effortMin !== undefined) {
      effort.$gte = effortMin;
    }
    if (effortMax !== undefined) {
      effort.$lte = effortMax;
    }
    // Also include documents without effort value too
    // (in other case you can remove set filter.effort=effort)
    filter.$or = [{ effort }, { effort: { $exists: false } }];
  }
  const results = await (await db).collection("issues")
    .aggregate([{ $match: filter },
      { $group: { _id: { statusKey: "$status", ownerKey: "$owner" }, count: { $sum: 1 } } }]).toArray();
  const _counts = {};
  results.forEach((element) => {
    // eslint-disable-next-line no-underscore-dangle
    const { statusKey, ownerKey } = element._id;
    if (!_counts[ownerKey]) _counts[ownerKey] = { owner: ownerKey };
    _counts[ownerKey][statusKey] = element.count;
  });
  return Object.values(_counts);
}

function restore(_, { id }) {
  return db.then((database) => database.collection("issues")
    .updateOne({ id, deleted: { $eq: true } },
      { $unset: { deleted: "", deletedAt: "" } }))
    .then((data) => {
      const { n, nModified } = data.result;
      if (nModified === 0 || n === 0) return false;
      return true;
    })
  // eslint-disable-next-line no-unused-vars
    .catch((_err) => false);
}

module.exports = {
  list,
  create: makeAuthenticatedResolver(create),
  getIssue,
  update: makeAuthenticatedResolver(update),
  remove: makeAuthenticatedResolver(remove),
  counts,
  restore: makeAuthenticatedResolver(restore),
};
