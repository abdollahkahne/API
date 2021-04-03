const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";
const getUser = (req) => {
  const token = req.cookies.jwt;
  if (!token) {
    return { signedIn: false };
  }
  const credentials = jwt.verify(token, JWT_SECRET);
  return credentials;
};

// function Wrapper: take a function and return another function which is augmented!
function makeAuthenticatedResolver(resolver) {
  return (parent, args, ctx) => {
    const { user } = ctx;
    if (!user || !user.signedIn) {
      throw new AuthenticationError("User sign in is required!");
    }
    return resolver(parent, args);
  };
}

module.exports = {
  verifyLogin: (req, res) => {
    const googleToken = req.body.google_token;
    if (!googleToken) {
      res.status(400).send("Missing Token");
    }
    const client = new OAuth2Client();
    client.verifyIdToken({ idToken: googleToken })
      .then((ticket) => {
        const payload = ticket.getPayload();
        const { given_name: givenName, email, name } = payload;
        const credentials = {
          signedIn: true,
          givenName,
          name,
          email,
        };
        const token = jwt.sign(credentials, JWT_SECRET, { expiresIn: "2h" });
        res.cookie("jwt", token, {
          httpOnly: true, maxAge: 7200000, domain: process.env.COOKIE_DOMAIN, sameSite: "None", secure: true,
        }).json(credentials);
      })
      .catch((err) => {
        console.log(err);
        res.status(403).send("Invalid Credentials");
      });
  },

  getSigninStatus: (req, res) => {
    const credentials = getUser(req);
    if (credentials.signedIn) {
      res.status(200).json(credentials);
    } else {
      res.status(401);
    }
  },

  signOut: (req, res) => {
    res.clearCookie("jwt").json({ success: true, message: "You signed out successfully" });
  },

  Utilities: { getUser, makeAuthenticatedResolver },
};
