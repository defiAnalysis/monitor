const env = process.env.NODE_ENV;

let FTMPROVIDER = "https://endpoints.omniatech.io/v1/eth/goerli/public";

let ngp_addr = "0x2fAD18285F4192A130752030D07fA39f9923Ad16";

if (env === "dev") {
  MYSQL_CONF = {
    host: "120.25.239.33",
    user: "root",
    password: "ngp123456",
    port: "7006",
    database: "ngpdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
  REDIS_CONF = {
    host: "127.0.0.1",
    port: "7069",
  };
  MQ_CONF = {
    host: "127.0.0.1",
    port: "7082",
  };
}

if (env === "prd") {
  MYSQL_CONF = {
    host: "localhost",
    user: "root",
    password: "ngp123456",
    port: "7006",
    database: "ngpdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
  REDIS_CONF = {
    host: "localhost",
    port: "7069",
  };
  MQ_CONF = {
    host: "localhost",
    port: "7082",
  };
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF,
  FTMPROVIDER,
  ngp_addr,
};
