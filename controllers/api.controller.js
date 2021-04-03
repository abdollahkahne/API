const { ApolloServer } = require("apollo-server-express");
const fs = require("fs");
const GraphQLDate = require("../resolvers/scalars/date.graphql");
const about = require("../resolvers/about.resolver");
const user = require("../resolvers/user.resolver");
const issues = require("../resolvers/issue.resolver");
const { Utilities: { getUser } } = require("./auth.controller");

const resolvers = {
  Query: {
    about: about.getMessage,
    user: user.getUser,
    issueList: issues.list,
    issueCounts: issues.counts,
    issue: issues.getIssue,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    issueAdd: issues.create,
    issueUpdate: issues.update,
    issueDelete: issues.remove,
    issueRestore: issues.restore,
  },
  GraphQLDate,
};

function getContext({ req }) {
  const credentials = getUser(req);
  return { user: credentials };
}

// file addres should start from root folder always
// it is different from module import/require
module.exports = new ApolloServer({
  typeDefs: fs.readFileSync("./resolvers/schema.graphql", "utf-8"),
  resolvers,
  context: getContext,
  playground: true,
  introspection: true,
  formatError: (err) => {
    console.log(err);
    return err;
  },
});
