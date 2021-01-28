import { Request, Response, Router, NextFunction } from 'express'
import { di } from '../di'
import jwt from '../middleware/jwt'
import { Secret } from '../config/config'
class authRoutes {
  encryptPassword(password: string) {
    let X = password
    const xconst = 37;
    let xout = "";
    let xpiece;
    let xchar: any
    let asciicode = 0
    let xnum: any = 0
    for (xpiece = 0; xpiece <= X.length - 1; xpiece++) {
      xchar = X.substring(xpiece, xpiece+1)
      if ([`D`, `p`, `d`, `t`].some((s) => s != xchar)) asciicode = xchar.charCodeAt(0)
      if (xchar == 'D') asciicode = 2
      if (xchar == 'p') asciicode = 3
      if (xchar == 'd') asciicode = 4
      if (xchar == 't') asciicode = 5
      xnum = (asciicode - (xpiece + 1) + xconst) % 255
      if (xnum > 127) xnum = (xnum + 128) % 255
      if (xnum < 32) xnum = (xnum + 40) % 255
      if (String.fromCharCode(xnum) == "^") xnum = xnum + 1;
      xout += String.fromCharCode(xnum % 255);
    }
    let xlen = xout.length
    for (xpiece = xlen + 1; xpiece <= 12; xpiece++) {
      xchar = xout.substring(xpiece - 1 - xlen, xpiece - 1 - xlen + 1);
      asciicode = xchar.charCodeAt(0)
      xnum = (asciicode * 2.345 * xconst * (xconst - 7)) % 255
      if (xnum > 127) xnum = (xnum + 128) % 255;
      if (xnum < 32) xnum = (xnum + 40) % 255;
      if (String.fromCharCode(xnum) == "^") xnum = xnum + 1;
      xout += String.fromCharCode(xnum % 255);
    }
    console.log(xout)
    return xout
  }
  login() {
    return async (req: Request, res: Response) => {
      if (Object.entries(req.body).length === 0) return res.status(400).send({ message: 'Body is empty!' })
      if (typeof req.body.username === 'undefined') return res.status(400).send({ message: 'Username is empty!' })
      if (typeof req.body.password === 'undefined') return res.status(400).send({ message: 'Password is empty!' })
      try {
        let { username, password } = req.body;
        let encrypt = this.encryptPassword(password)
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
          repos.reserve((err: any, connObj: any) => {
            if (connObj) {
              let conn = connObj.conn;
              
              conn.createStatement((err: any, statement: any) => {
                if (err) {
                  reject(err);
                } else {
                  statement.setFetchSize(100, function (err: any) {
                    if (err) {
                      reject(err);
                    } else {
                      const query = `SELECT 
                                     SSUSR_RowId, SSUSR_Initials, SSUSR_Name, SSUSR_Password, SSUSR_DateFrom, SSUSR_DateTo
                                     FROM SQLUser.SS_User
                                     WHERE SSUSR_Initials = '${username}' AND SSUSR_Password = '${encrypt}'`;           
                      statement.executeQuery(query, function (
                        err: any,
                        resultset: any
                      ) {
                        if (err) {
                          reject(err);
                        } else {
                          resultset.toObjArray(function (
                            err: any,
                            results: any
                          ) {
                            resolve(results);
                          });
                        }
                      });
                    }
                  });
                }
              });
              repos.release(connObj, function (err: any) {
                if (err) {
                  console.log(err);
                }
              });
            }
          });
        });
        if (!result.length) {
          return res.json({status: '400', message: 'username or password invalid' })
        } 
        const token = `Bearer ` + jwt.generateToken({ username, encrypt }, Secret.SECRET, '1d')
        res.json({status: '200', token, message: 'You are login' })
        } catch (error) {
          if (error.sql !== undefined) {
            return res.json({status: '400', message: error.sqlMessage })
            // res.status(400).send({ message: error.sqlMessage })
          } else {
            return res.json({status: '400', message: error.sqlMessage })
            // res.status(400).send(error)
          }
        }
    }
  }
}

const router = Router()
const route = new authRoutes()

router.post('/login', route.login())

export const auth = router
