import dotenv from "dotenv";
const dotenvParseVariables = require("dotenv-parse-variables");
let env: any = dotenv.config();
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);

export const 
  Secret = {
    SECRET: env.SECRET_KEY || 'SECRET_KEY',
  },
  preRegister = {
    HOST: env.HOST,
    PORT: env.PORT,
    USER: env.USER,
    PASSWORD: env.PASSWORD,
    DATABASE_NAME: env.DATABASENAME,
  };
