import dotenv from "dotenv";
const dotenvParseVariables = require("dotenv-parse-variables");
let env: any = dotenv.config();
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);

export const preRegister = {
  HOST: env.HOST,
  PORT: env.PORT,
  USER: env.USER,
  PASSWORD: env.PASSWORD,
  DATABASE_NAME: env.DATABASENAME,
};
