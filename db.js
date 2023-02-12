const mysql = require("mysql2/promise");
const { MYSQL_CONF } = require("./conf");
let db = {};

const pool = mysql.createPool(MYSQL_CONF);

db.escape = (text) => mysql.escape(text);

db.dowork = async (sql, paras) => {
  try {
    let conn = await pool.getConnection();

    let [rows] = await conn.query(sql, paras);
    conn.release();

    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = { db };
