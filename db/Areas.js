const db = require(".");

//Obtener Áreas criticas de la base de datos
let list = () => {
  return new Promise((resolve, reject) => {
    db.query("select * from areas order by id", (err, res) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(res.rows);
    });
  });
};

module.exports = {
  list,
};