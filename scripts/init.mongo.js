// This will be run on mongo shell using the following command
// mongo issuetracker scripts.init.mongo.js
db.issues.drop(); /* eslint no-undef:"off" */
const initialIssues = [
  {
    id: 1,
    title: "Error in Console when clicking Add",
    status: "New",
    owner: "Shahrzad",
    effort: 5,
    createdAt: new Date("2019-08-08"),
    due: undefined,
    description: `By far the easiest and also one of the most important checks is to test if your entire website can be reached and used with the keyboard alone. Do this by:
    Disconnecting your mouse.
    Using Tab and Shift+Tab to browse.
    Using Enter to activate elements.
    Where required, using your keyboard arrow keys to interact with some elements, such as menus and dropdowns`,
  },
  {
    id: 2,
    title: "Missing bottom border on panel",
    status: "Assigned",
    owner: "Ali",
    effort: 10,
    createdAt: new Date("2018-07-18"),
    due: new Date("2018-10-21"),
    description: "We can check some accessibility features directly in our JSX code. Often intellisense checks are already provided in JSX aware IDE’s for the ARIA roles, states and properties. We also have access to the following tool:",
  },
];

db.issues.insertMany(initialIssues);
const count = db.issues.count();
// eslint-disable-next-line no-restricted-globals
print("Inserted", count, "issues");
db.counters.remove({ _id: "issues" });
db.counters.insertOne({ _id: "issues", current: count });
db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ owner: 1 });
db.issues.createIndex({ createdAt: 1 });

// This will create text index using field Title
db.issues.createIndex({ title: "text", description: "text" });
