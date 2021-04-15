import { Request, Response, Router } from 'express'
import { di } from '../di'
import * as _ from 'lodash'
import CryptoJS from "crypto-js";
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');

class ctRoute {
  Capitalize = (s: any ) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  getPatientList() {
    return async (req: Request, res: Response) => {
      let { query, id } = req.query
      let repos = di.get('repos')
      //let query = `SELECT TC_RowId FROM Consent_Send_Email.Patient_Data WHERE TC_RowIdHash = '${rowIdHash}'`
      //let result1 = await repos.query(query)
      //let rowId = result1[0].TC_RowId

      repos = di.get("cache");
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
                       console.log('1111')

                      const query = `SELECT DISTINCT PAPMI_RowId "TC_RowId",'' "TC_RowIdHash", PAPMI_No "HN", PAPER_PassportNumber "Passport",
                      PAPMI_ID "NationalID",  PAPMI_Title_DR "Title", PAPMI_Name "FirstName", PAPMI_Name2 "LastName",
                      tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                      PAPMI_Sex_DR "Gender",
                      PAPER_Nation_DR "Nationality",
                      PAPER_Religion_DR "Religion",
                      PAPMI_MobPhone "MobilePhone",
                      PAPMI_Email "Email",
                      CASE 
                        WHEN PAPER_Country_DR IS NULL 
                          AND ((PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (PAPER_Zip_DR->CTZIP_Province_DR NOT IN ('77', '78') AND PAPER_Zip_DR->CTZIP_Province_DR IS NOT NULL)
                          OR (PAPER_Zip_DR->CTZIP_CITY_DR NOT IN ('1116', '936') AND PAPER_Zip_DR->CTZIP_CITY_DR IS NOT NULL)) THEN 2
                        ELSE PAPER_Country_DR 
                      END "Country",
                      CASE
                        WHEN PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
                        ELSE  PAPER_Zip_DR->CTZIP_Code
                      END "Postcode",
                      CASE
                        WHEN PAPER_Zip_DR->CTZIP_Province_DR IN ('77', '78') THEN null
                        ELSE PAPER_Zip_DR->CTZIP_Province_DR
                      END "Province",
                      CASE
                        WHEN PAPER_Zip_DR->CTZIP_CITY_DR IN ('1116', '936') THEN null
                        ELSE  PAPER_Zip_DR->CTZIP_CITY_DR
                      END "District",
                      PAPER_CityArea_DR "Subdistrict",
                      PAPER_StName "Address",
                      '' "LinkExpireDate"
                      FROM PA_PatMas
                      INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                      INNER JOIN PA_Adm ON PA_PatMas.PAPMI_RowId = PA_Adm.PAADM_PAPMI_DR
                      WHERE YEAR(PAADM_AdmDate) BETWEEN 2021 AND 2021 AND PAADM_AdmNo IS NOT NULL AND PAADM_VisitStatus <> 'C' AND PAADM_VisitStatus <> 'Cancelled'`;           
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
      console.log('2222')
      //res.send(result) 
      repos = di.get('repos')
      await result.map((d:any) => {
        //let linkexpiredate = new Date()
        //linkexpiredate.setDate(linkexpiredate.getDate() + 7)
        //d.LinkExpireDate = linkexpiredate
        d.LinkExpireDate = null

        // let hash = CryptoJS.algo.SHA256.create();
        // hash.update(d.TC_RowId.toString() + linkexpiredate.toString());
        // d.TC_RowIdHash = hash.finalize().toString();
        
        //let queryInfo = `REPLACE INTO consent_management.Patient_Data SET ?`
        let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

        repos.query(queryInfo, d);
        //res.send({status: 200})
      })
      console.log('3333')

      // res.send(result1) 
    }
  }
  getInfo() {
    return async (req: Request, res: Response) => {
      let { rowIdHash } = req.query
      let repos = di.get('repos')
      let date = new Date()
      let linkexpiredate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getDate()
        // let query = `SELECT * FROM consent_management.Patient_Data WHERE TC_RowIdHash = '${rowIdHash}' AND LinkExpireDate < '2021-03-23'`
        // let result = await repos.query(query)
        // if(result.length > 0)
        // {
        //   res.send(result[0])
        // }
      
      
      

       
    }
  }
  getGender() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM preregistration_drivethru.CT_Sex`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getReligion() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID = 4 UNION 
       SELECT * FROM preregistration_drivethru.CT_Religion WHERE ID != 10 AND ID != 4 `

      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Desc":  d.Desc,
        }
      })
      res.send(response) 
    }
  }
  getProvince() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = ''
      query = `SELECT * FROM preregistration_drivethru.CT_Province WHERE Code NOT IN ('999', '900') `
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  
  
  getCity() {
    return async (req: Request, res: Response) => {
      let { provinceid } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT ca.* FROM preregistration_drivethru.CT_City ca `
      
      if(!_.isEmpty(provinceid) && provinceid !== 'undefined')
      query +=`WHERE ca.Province_ID = '${provinceid}' `

      let result = await repos.query(query)
      let response: any
      response = await result.map((d: any) => {
        return {
          ID: d.ID,
          Desc: d.Desc,
        }
      })
      
      res.send(response) 
    }
  }
  getCityArea() {
    return async (req: Request, res: Response) => {
      let { cityid } = req.query
      let repos = di.get('repos')
      let query = ''
      
      query = `SELECT ca.* FROM preregistration_drivethru.CT_Cityarea ca `
      
      if(!_.isEmpty(cityid) && cityid !== 'undefined')
      query +=`WHERE ca.City_ID = '${cityid}'`
              
      let result = await repos.query(query)
      let response: any
      response = await result.map((d: any) => {
        return {
          ID: d.ID,
          Desc: d.Desc,
        }
      })
      res.send(response) 
    }
  }
  getZip() {
    return async (req: Request, res: Response) => {
      let { provinceid, cityid, cityareaid } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT *  FROM preregistration_drivethru.CT_Zip `

      if(!_.isEmpty(provinceid) && !_.isEmpty(cityid) && !_.isEmpty(cityareaid))
      query +=`Where Province_ID = '${provinceid}' AND City_ID = '${cityid}' AND Cityarea_ID = '${cityareaid}' `
              
      let result = await repos.query(query)
      res.send(result) 
    }
  }

  postPatientList() {
    return async (req: Request, res: Response) => {
      let data = req.body
      let repos = di.get('repos')
      try {
        console.log('3333')
        console.log(req.body)
        await req.body.map((d:any) => {
          let linkexpiredate = new Date()
          linkexpiredate.setDate(linkexpiredate.getDate() + 7)
          d.LinkExpireDate = linkexpiredate
          console.log(d)
          // let hash = CryptoJS.algo.SHA256.create();
          // hash.update(d.TC_RowId.toString() + linkexpiredate.toString());
          // d.TC_RowIdHash = hash.finalize().toString();
          
          //let queryInfo = `REPLACE INTO consent_management.Patient_Data SET ?`
          let queryInfo = `REPLACE INTO Consent_Send_Email_Prepare.patient_data SET ?`

          repos.query(queryInfo, d);
          res.send({status: 200})
        })
      } catch (error) {
        res.send({status: 404})
      }
      
      

      
      
      
      
      // let repos = di.get("repos");
      // try {
      //   let test = axios({method: 'post',url:`http://10.105.10.29:1881/onetrust_consent_post`, data:  {national_id, site, consentData}})
      // .then(function (response) {
      //   res.send({status: 200})
      // }).catch(function (error) {
      //   res.send({status: 404})
      //   //res.send(response.data)
      // })
      
        
      // } catch (error) {
      //   console.log(error);
      //   res.status(404).json([])
      // }
    }
  }
  
  
  
}

const router = Router()
const route = new ctRoute()

router
  .get("/patientlist", route.getPatientList())
  .get("/info", route.getInfo())
  .get("/gender", route.getGender())
  .get("/religion", route.getReligion())
  .get("/zip", route.getZip())
  .get("/province", route.getProvince())
  .get("/city", route.getCity())
  .get("/cityarea", route.getCityArea())
  .post("/postpatientlist", route.postPatientList())
  
  
export const patient = router