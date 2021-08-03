import {Request, Response, Router} from 'express'
import {di} from '../di'
import * as _ from 'lodash'
import CryptoJS from "crypto-js";
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');
import axios from 'axios'
import {neo4jSetting} from "../config/config";

class ctRoute {
    Capitalize = (s : any) => {
        if (typeof s !== 'string') 
            return ''


        


        return s.charAt(0).toUpperCase() + s.slice(1)
    }
    getPatientList() {
        return async (req : Request, res : Response) => {
            let {query, id} = req.query
            let repos = di.get('repos')
            // let query = `SELECT TC_RowId FROM Consent_Send_Email.Patient_Data WHERE TC_RowIdHash = '${rowIdHash}'`
            // let result1 = await repos.query(query)
            // let rowId = result1[0].TC_RowId

            repos = di.get("cache");
            let result: any = await new Promise((resolve, reject) => {
                repos.reserve((err : any, connObj : any) => {
                    if (connObj) {
                        let conn = connObj.conn;

                        conn.createStatement((err : any, statement : any) => {
                            if (err) {
                                reject(err);
                            } else {
                                statement.setFetchSize(100, function (err : any) {
                                    if (err) {
                                        reject(err);
                                    } else {


                                        const query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
                      PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
                      tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                      PAPMI_Sex_DR "Gender",
                      PAPER_Nation_DR "Nationality",
                      PAPER_Religion_DR "Religion",
                      PAPMI_MobPhone "MobilePhone",
                      PAPMI_Email "Email",
                      PAPMI_PrefLanguage_DR "Language",
                      '' "LinkExpireDate"
                      FROM PA_PatMas
                      INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                      INNER JOIN PA_Adm ON PA_PatMas.PAPMI_RowId = PA_Adm.PAADM_PAPMI_DR
                      WHERE YEAR(PAADM_AdmDate) BETWEEN 2021 AND 2021 AND PAADM_AdmNo IS NOT NULL AND PAADM_VisitStatus <> 'C' AND PAADM_VisitStatus <> 'Cancelled'`;
                                        statement.executeQuery(query, function (err : any, resultset : any) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resultset.toObjArray(function (err : any, results : any) {
                                                    console.log(results)
                                                    resolve(results);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        repos.release(connObj, function (err : any) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            });
            console.log('2222')
            // res.send(result)
            repos = di.get('repos')
            await result.map((d : any) => {
                // let linkexpiredate = new Date()
                // linkexpiredate.setDate(linkexpiredate.getDate() + 7)
                // d.LinkExpireDate = linkexpiredate
                d.LinkExpireDate = null

                // let hash = CryptoJS.algo.SHA256.create();
                // hash.update(d.TC_RowId.toString() + linkexpiredate.toString());
                // d.TC_RowIdHash = hash.finalize().toString();

                // let queryInfo = `REPLACE INTO consent_management.Patient_Data SET ?`
                let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

                repos.query(queryInfo, d);
                // res.send({status: 200})
            })
            console.log('3333')

            // res.send(result1)
        }
    }

    getPatientData() {
        return async (req : Request, res : Response) => {
            let {national_id, passport, reference, otp} = req.query
            let repos = di.get('repos')
            const neo4j = require('neo4j-driver')

            const driver = neo4j.driver('bolt://10.105.107.65:7687/', neo4j.auth.basic(neo4jSetting.USER, neo4jSetting.PASSWORD))
            const session = driver.session({database: 'prodtrak'});
            let condition = ''
            if (!_.isEmpty(national_id)) {
                condition = `replace(replace(n.PAPER_ID," ",""),"-","") = '${national_id}'`
            } else {
                condition = `replace(replace(n.PassportNumber," ",""),"-","" = '${passport}`
            }
            let neo4jquery = `MATCH (n:PA_Person) WHERE ${condition} RETURN n`
            await session.run(neo4jquery).then(function (result : any) {
                if (result.records.length > 0) {
                    let body = {
                        Identifier: !_.isEmpty(national_id) ? national_id : passport,
                        Reference: reference,
                        OTP: otp

                    }
                    repos = di.get('repos')
                    let query = `REPLACE INTO consent_management.OTP_Request SET ?`
                    repos.query(query, body)

                    let mail_from = "noreply@samitivej.co.th"
                    let mail_to = "numpon@lbsconsultant.com"
                    // let mail_to = "Pratarn.Ch@samitivej.co.th"
                    let mail_subject = "Samitivej OTP"
                    let mail_body = `Samitivej Ref:${reference} (within 15 minute) OTP code is ${otp}`
                    axios({
                        method: 'post',
                        url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
                        data: {
                            mail_from,
                            mail_to,
                            mail_subject,
                            mail_body
                        }
                    })
                    res.send({result, body})
                } else {
                    res.send(null)
                }
                // console.log(result.records.length);
                // return result.records.map((record : any) => {
                //     console.log(record.get("n"));
                // });
            }).catch((e : any) => { // Output the error
                console.log(e);
            }).then(() => { // Close the Session
                return session.close();
            }).then(() => { // Close the Driver
                return driver.close();
            });


            // let result: any = await new Promise((resolve, reject) => {
            //     repos.reserve((err : any, connObj : any) => {
            //         if (connObj) {
            //             let conn = connObj.conn;

            //             conn.createStatement((err : any, statement : any) => {
            //                 if (err) {
            //                     reject(err);
            //                 } else {
            //                     statement.setFetchSize(100, function (err : any) {
            //                         if (err) {
            //                             reject(err);
            //                         } else {

            //                             let query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
            //           PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
            //           tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
            //           PAPMI_Sex_DR "Gender",
            //           PAPER_Nation_DR "Nationality",
            //           PAPER_Religion_DR "Religion",
            //           PAPMI_MobPhone "MobilePhone",
            //           PAPMI_Email "Email",
            //           PAPMI_PrefLanguage_DR "Language",
            //           '' "LinkExpireDate"
            //           FROM PA_PatMas
            //           INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
            //           WHERE `;
            //                             if (!_.isEmpty(national_id)) {
            //                                 query += ` REPLACE(PAPER_ID,' ','') = '${
            //                                     national_id
            //                                 }' `
            //                             } else {
            //                                 query += ` PAPER_PassportNumber = '${
            //                                     passport
            //                                 }' `
            //                             }

            //                             statement.executeQuery(query, function (err : any, resultset : any) {
            //                                 if (err) {
            //                                     reject(err);
            //                                 } else {
            //                                     resultset.toObjArray(function (err : any, results : any) {
            //                                         if (results.length > 0) {

            //                                             let body = {
            //                                                 Identifier: !_.isEmpty(national_id) ? national_id : passport,
            //                                                 Reference: reference,
            //                                                 OTP: otp

            //                                             }
            //                                             repos = di.get('repos')
            //                                             let query = `REPLACE INTO consent_management.OTP_Request SET ?`
            //                                             repos.query(query, body)

            //                                             let mail_from = "noreply@samitivej.co.th"
            //                                             let mail_to = "numpon@lbsconsultant.com"
            //                                             // let mail_to = "Pratarn.Ch@samitivej.co.th"
            //                                             let mail_subject = "Samitivej OTP"
            //                                             let mail_body = `Samitivej Ref:${reference} (within 15 minute) OTP code is ${otp}`
            //                                             axios({
            //                                                 method: 'post',
            //                                                 url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
            //                                                 data: {
            //                                                     mail_from,
            //                                                     mail_to,
            //                                                     mail_subject,
            //                                                     mail_body
            //                                                 }
            //                                             })
            //                                             res.send({result, body})
            //                                         } else {
            //                                             console.log('2222')
            //                                             res.send(null)
            //                                         }
            //                                         resolve(results);
            //                                     });
            //                                 }
            //                             });
            //                         }
            //                     });
            //                 }
            //             });
            //             repos.release(connObj, function (err : any) {
            //                 if (err) {
            //                     console.log(err);
            //                 }
            //             });
            //         }
            //     });
            // });


        }
    }

    getCaptcha() {
        return async (req : Request, res : Response) => {
            let {site} = req.query
            var svgCaptcha = require('svg-captcha');
            let option = {
                size: 6, // size of random string
                noise: 5, // number of noise lines
                color: true, // characters will have distinct colors instead of grey, true if background option is set
                background: '#cc9966' // background color of the svg image
            }

            var captcha = svgCaptcha.create(option, 'text');
            res.status(200).send(captcha);


        }
    }

    postToken() {
        return async (req : Request, res : Response) => {
            let {token, randomstrfont, randomstrback} = req.body
            let repos = di.get('sql')
              let queryInfo = `INSERT INTO Vaccine_Token 
               (Token, RandomStrFont, RandomStrBack) VALUES ('${token}', '${randomstrfont}', '${randomstrback}')`
               await repos.query(queryInfo)
              res.send([])

        }
    }
    postReisterVaccine() {
        return async (req : Request, res : Response) => {
            let repos = di.get('sql')
            let {Firstname, Lastname, VaccineQuantity, Nationality, Mobilephone, HN, token} = req.body
              let queryInfo = `INSERT INTO Vaccine_Register
              (Firstname, Lastname, VaccineQuantity, Nationality, Mobilephone, HN, Token)
              VALUES('${Firstname}', '${Lastname}', '${VaccineQuantity}', '${Nationality}', '${Mobilephone}', '${HN}', '${token}');
              `
              await repos.query(queryInfo);
              res.send([])

        }
    }

    checkTokenExpire() {
        return async (req : Request, res : Response) => {
            let repos = di.get('sql')
            let {token} = req.body
            let query = `SELECT * from Vaccine_Token Where Token = '${token}' AND ExpireDateTime > DATEADD(HOUR, 7, GETDATE())`
            let data = await repos.query(query)
            res.send(data.rowsAffected)

        }
    }

    test() {
        return async (req : Request, res : Response) => {
            let {identifier, otp, reference} = req.query
            delete axios.defaults.baseURL
            axios.get(`http://10.105.10.29:1881/verifypatientdata?national_id=1341400135163&passport=null`)
        }
    }

    verifyOTP() {
        return async (req : Request, res : Response) => {
            let {identifier, otp, reference} = req.query
            let repos = di.get('repos')

            let query = `SELECT * FROM consent_management.OTP_Request WHERE Identifier = '${identifier}' 
            AND Reference = '${reference}' AND OTP = '${otp}' AND ExpireTime > NOW()`
            let data = await repos.query(query)


            res.send(data)
        }
    }

    getInfo() {
        return async (req : Request, res : Response) => {
            let {rowIdHash} = req.query
            let repos = di.get('repos')
            let date = new Date()
            let linkexpiredate = date.getFullYear() + "-" + (
                "0" + (
                    date.getMonth() + 1
                )
            ).slice(-2) + "-" + date.getDate()
            let query = `SELECT * FROM consent_management.Patient_Data WHERE TC_RowIdHash = '${rowIdHash}' AND LinkExpireDate < ${linkexpiredate}`
            let result = await repos.query(query)
            if(result.length > 0)
            {
            res.send(result[0])
            }


        }
    }
    getGender() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `SELECT * FROM preregistration_drivethru.CT_Sex`
            let result = await repos.query(query)
            res.send(result)
        }
    }
    getReligion() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = `SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID = 4 UNION 
       SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID != 10 AND ID != 4 `

            let result = await repos.query(query)
            let response = result.map((d : any) => {
                return {"ID": d.ID, "Desc": d.Desc}
            })
            res.send(response)
        }
    }
    getProvince() {
        return async (req : Request, res : Response) => {
            let repos = di.get('repos')
            let query = ''
            query = `SELECT * FROM preregistration_drivethru.CT_Province WHERE Code NOT IN ('999', '900') `

            let result = await repos.query(query)
            res.send(result)
        }
    }


    getCity() {
        return async (req : Request, res : Response) => {
            let {provinceid} = req.query
            let repos = di.get('repos')
            let query = ''
            query = `SELECT ca.* FROM preregistration_drivethru.CT_City ca `

            if (!_.isEmpty(provinceid) && provinceid !== 'undefined') 
                query += `WHERE ca.Province_ID = '${provinceid}' `


            


            let result = await repos.query(query)
            let response: any
            response = await result.map((d : any) => {
                return {ID: d.ID, Desc: d.Desc}
            })

            res.send(response)
        }
    }

    testMail() {
        return async (req : Request, res : Response) => {
            console.log("testmail")
            const nodemailer = require("nodemailer");
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "DC-EXCHC.BDMS.CO.TH", port: 25, secure: false, // true for 465, false for other ports
                auth: {
                    user: "sysadmin@samitivej.co.th", // generated ethereal user
                    pass: "Pa$$w0rd!", // generated ethereal password
                    tls: {
                        rejectUnauthorized: false
                    }
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: 'numpon.sk@hotmail.com', // sender address
                to: "numpontae09@gmail.com", // list of receivers
                subject: "Hello ✔", // Subject line
                text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            });
            console.log("Message sent: %s", info.messageId);
        }
    }

    getCityArea() {
        return async (req : Request, res : Response) => {
            let {cityid} = req.query
            let repos = di.get('repos')
            let query = ''

            query = `SELECT ca.* FROM preregistration_drivethru.CT_Cityarea ca `

            if (!_.isEmpty(cityid) && cityid !== 'undefined') 
                query += `WHERE ca.City_ID = '${cityid}'`


            


            let result = await repos.query(query)
            let response: any
            response = await result.map((d : any) => {
                return {ID: d.ID, Desc: d.Desc}
            })
            res.send(response)
        }
    }
    getZip() {
        return async (req : Request, res : Response) => {
            let {provinceid, cityid, cityareaid} = req.query
            let repos = di.get('repos')
            let query = ''
            query = `SELECT *  FROM preregistration_drivethru.CT_Zip `

            if (!_.isEmpty(provinceid) && !_.isEmpty(cityid) && !_.isEmpty(cityareaid)) 
                query += `Where Province_ID = '${provinceid}' AND City_ID = '${cityid}' AND Cityarea_ID = '${cityareaid}' `


            


            let result = await repos.query(query)
            res.send(result)
        }
    }

    postPatientList() {
        return async (req : Request, res : Response) => {
            let data = req.body
            let repos = di.get('repos')
            try {
                console.log('3333')
                console.log(req.body)
                await req.body.map((d : any) => {
                    let linkexpiredate = new Date()
                    linkexpiredate.setDate(linkexpiredate.getDate() + 7)
                    d.LinkExpireDate = linkexpiredate
                    console.log(d)
                    // let hash = CryptoJS.algo.SHA256.create();
                    // hash.update(d.TC_RowId.toString() + linkexpiredate.toString());
                    // d.TC_RowIdHash = hash.finalize().toString();

                    // let queryInfo = `REPLACE INTO consent_management.Patient_Data SET ?`
                    let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

                    repos.query(queryInfo, d);
                    res.send({status: 200})
                })
            } catch (error) {
                res.send({status: 404})
            }


            // let repos = di.get("repos");
            // try {
            // let test = axios({method: 'post',url:`http://10.105.10.29:1881/onetrust_consent_post`, data:  {national_id, site, consentData}})
            // .then(function (response) {
            // res.send({status: 200})
            // }).catch(function (error) {
            // res.send({status: 404})
            // //res.send(response.data)
            // })


            // } catch (error) {
            // console.log(error);
            // res.status(404).json([])
            // }
        }
    }


    verifyPatientData() {
        return async (req : Request, res : Response) => {
            let data = req.body
            let repos = di.get('repos')
            try {
                repos = di.get("cache");
                let result: any = await new Promise((resolve, reject) => {
                    repos.reserve((err : any, connObj : any) => {
                        if (connObj) {
                            let conn = connObj.conn;

                            conn.createStatement((err : any, statement : any) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    statement.setFetchSize(100, function (err : any) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            let query = `SELECT PAPER_PAPMI_DR->PAPMI_No
                      FROM PA_Person
                      WHERE PAPER_Name = '${
                                                data.firstname
                                            }' 
                      AND PAPER_Name2 = '${
                                                data.lastname
                                            }' 
                      AND PAPER_DOB = '${
                                                data.dob.slice(0, 10)
                                            }' 
                      AND PAPER_MobPhone = '${
                                                data.phone_no
                                            }' 
                      AND PAPER_Email = '${
                                                data.email
                                            }'`;

                                            if (!_.isEmpty(data.national_id)) {
                                                query += `AND PAPER_ID = '${
                                                    data.national_id
                                                }' `
                                            }

                                            statement.executeQuery(query, function (err : any, resultset : any) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resultset.toObjArray(function (err : any, results : any) {
                                                        console.log(results)
                                                        resolve(results);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            repos.release(connObj, function (err : any) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                });
                console.log(result)
                let mail_from = "Samitivej_NoReplay@samitivej.co.th"
                let mail_to = "numpontae09@gmail.com"
                let mail_subject = "Test Test"
                let mail_body = "Test Test Body"
                console.log(req.body)
                let test = axios({
                    method: 'post',
                    url: `http://10.105.10.50:8014/Service/sendEmailAPI`,
                    data: {
                        mail_from,
                        mail_to,
                        mail_subject,
                        mail_body
                    }
                }).then(function (response) {
                    res.send({status: 200})
                }).catch(function (error) {
                    res.send({status: 404})
                })


                // repos = di.get("cache");
                // let result: any = await new Promise((resolve, reject) => {
                // repos.reserve((err: any, connObj: any) => {
                //     if (connObj) {
                //       let conn = connObj.conn;

                //       conn.createStatement((err: any, statement: any) => {
                //         if (err) {
                //           reject(err);
                //         } else {
                //           statement.setFetchSize(100, function (err: any) {
                //             if (err) {
                //               reject(err);
                //             } else {
                //                console.log('1111')

                //               const query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
                //               PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
                //               tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                //               PAPMI_Sex_DR "Gender",
                //               PAPER_Nation_DR "Nationality",
                //               PAPER_Religion_DR "Religion",
                //               PAPMI_MobPhone "MobilePhone",
                //               PAPMI_Email "Email",
                //               PAPMI_PrefLanguage_DR "Language",
                //               '' "LinkExpireDate"
                //               FROM PA_PatMas
                //               INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                //               INNER JOIN PA_Adm ON PA_PatMas.PAPMI_RowId = PA_Adm.PAADM_PAPMI_DR
                //               WHERE YEAR(PAADM_AdmDate) BETWEEN 2021 AND 2021 AND PAADM_AdmNo IS NOT NULL AND PAADM_VisitStatus <> 'C' AND PAADM_VisitStatus <> 'Cancelled'`;
                //               statement.executeQuery(query, function (
                //                 err: any,
                //                 resultset: any
                //               ) {
                //                 if (err) {
                //                   reject(err);
                //                 } else {
                //                   resultset.toObjArray(function (
                //                     err: any,
                //                     results: any
                //                   ) {
                //                     resolve(results);
                //                   });
                //                 }
                //               });
                //             }
                //           });
                //         }
                //       });
                //       repos.release(connObj, function (err: any) {
                //         if (err) {
                //           console.log(err);
                //         }
                //       });
                //     }
                // });
                // });

                // await req.body.map((d:any) => {
                // let linkexpiredate = new Date()
                // linkexpiredate.setDate(linkexpiredate.getDate() + 7)
                // d.LinkExpireDate = linkexpiredate
                // console.log(d)

                // let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

                // repos.query(queryInfo, d);
                // res.send({status: 200})
                // })
            } catch (error) {
                res.send({status: 404})
            }


            // let repos = di.get("repos");
            // try {
            // let test = axios({method: 'post',url:`http://10.105.10.29:1881/onetrust_consent_post`, data:  {national_id, site, consentData}})
            // .then(function (response) {
            // res.send({status: 200})
            // }).catch(function (error) {
            // res.send({status: 404})
            // //res.send(response.data)
            // })


            // } catch (error) {
            // console.log(error);
            // res.status(404).json([])
            // }
        }
    }


}


const router = Router()
const route = new ctRoute()

router
.post("/posttoken", route.postToken())
.post("/postregister", route.postReisterVaccine())
.post("/checktokenexpire", route.checkTokenExpire())

export const patient = router
