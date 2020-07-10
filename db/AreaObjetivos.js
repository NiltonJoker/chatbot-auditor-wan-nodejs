const db = require(".");

//Obtener criticas de la base de datos
let list = (area) => {
  return new Promise((resolve, reject) => {
    db.query(`select * from objetivos_areas where id_area = ${area}`, (err, res) => {
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