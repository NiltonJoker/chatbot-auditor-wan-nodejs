const { Pool } = require("pg");
// require("dotenv").config();
const pool = new Pool({
  user: "dudrazfhudohhu",
  host: "ec2-34-197-188-147.compute-1.amazonaws.com",
  password: "fed99edec057dca712e7c6a28cd52bfb6f1f38e029172e5dc194af1e1a6918b0",
  database: "d4u08471dh7v49",
  port: 5432,
  ssl:true,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  getClient: (callback) => {
    pool.connect((err, client, done) => {
      const query = client.query;
      // monkey patch the query method to keep track of the last query executed
      client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
      };
      // set a timeout of 5 seconds, after which we will log this client's last query
      const timeout = setTimeout(() => {
        console.error("A client has been checked out for more than 5 seconds!");
        console.error(
          `The last executed query on this client was: ${client.lastQuery}`
        );
      }, 5000);
      const release = (err) => {
        // call the actual 'done' method, returning this client to the pool
        done(err);
        // clear our timeout
        clearTimeout(timeout);
        // set the query method back to its old un-monkey-patched version
        client.query = query;
      };
      callback(err, client, release);
    });
  },
};
