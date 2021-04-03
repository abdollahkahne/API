const { Utilities: { makeAuthenticatedResolver } } = require("../controllers/auth.controller");

let aboutMessage = "Issue Tracker API V1.0";

function setMessage(_, { message }) {
  aboutMessage = message;
  return {
    success: true,
    message: aboutMessage,
  };
}

function getMessage() {
  return aboutMessage;
}

module.exports = {
  setMessage: makeAuthenticatedResolver(setMessage),
  getMessage,
};
