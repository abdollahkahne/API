const { Kind, GraphQLScalarType } = require("graphql");

module.exports = new GraphQLScalarType({
  name: "GraphQLDate",
  description: "A scalar type for saving Dates as graphql scalars",
  serialize: (value) => value.toISOString(),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      // eslint-disable-next-line no-restricted-globals
      return isNaN(new Date(ast.value)) ? undefined : new Date(ast.value);
    }
    return undefined;
  },
  // eslint-disable-next-line no-restricted-globals
  parseValue: (value) => (isNaN(new Date(value)) ? undefined : new Date(value)),
});
