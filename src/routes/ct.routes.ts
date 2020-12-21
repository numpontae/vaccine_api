import { Request, Response, Router } from 'express'
import { di } from '../di'
import * as _ from 'lodash'

class ctRoute {
  Capitalize = (s: any ) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  getTitle() {
    return async (req: Request, res: Response) => {
      
      let { language, id } = req.query

      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Title`
      if (language == 'th') query += ` Where Code IN ('00008', '00010', '00116', '00117', '00118')`
      if (language == 'en') query += ` Where Code IN ('00008e', '00116e', '00010E', '00118e')`
      if (id && id !== 'undefined' && id != null) query += ` And ID = ${id}`
      let result = await repos.query(query)
      await result.map((d: any) => d.Desc = this.Capitalize(d.Desc.toLowerCase()))
      
      res.send(result) 
      


      // let repos = di.get('repos')
      // let query = `select Firstname from Registration.Patient_Info pi2 where Firstname = 'นำพล' or Firstname = 'รุ่งนภา' `
      // let result = await repos.query(query)
      // //await result.map((d: any) => d.Desc = this.Capitalize(d.Desc.toLowerCase()))
      // console.log(result.Fir) 
      
      

      // repos = di.get('cache')
      // result = await new Promise((resolve, reject) => {
      //   repos.reserve((err: any, connObj: any) => {
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
      //               const query = `SELECT
      //               PAPMI_RowId,
      //         PAPMI_No "hn",
      //               PAPMI_Title_DR->TTL_RowId "title",
      //               PAPMI_Name "firstname",
      //               PAPMI_Name2 "lastname",
      //               PAPMI_Name5 "nameen",
      //               PAPMI_Name7 "surnameen",
      //               tochar(PAPMI_RowId->PAPER_Dob, 'YYYY-MM-DD') "dob",
      //               PAPMI_Sex_DR->CTSEX_RowId "gender",
      //               PAPMI_RowId->PAPER_Nation_DR->CTNAT_RowId "nationality",
      //               PAPMI_RowId->PAPER_Religion_DR->CTRLG_RowId "religion",
      //         PAPMI_RowId->PAPER_Religion_DR->CTRLG_Code "religion_code",
      //               PAPMI_RowId->PAPER_Religion_DR->CTRLG_Desc "religion_desc",
      //         PAPMI_RowId->PAPER_PrefLanguage_DR "preferredlanguage",
      //               PAPMI_Email "email",
      //               PAPMI_RowId->PAPER_ID "nationalid",
      //               PAPMI_RowId->PAPER_PassportNumber "passport",
      //               SUBSTRING(PAPMI_RowId->PAPER_Marital_DR->CTMAR_Desc, CHARINDEX('(', PAPMI_RowId->PAPER_Marital_DR->CTMAR_Desc)+1, (LENGTH(PAPMI_RowId->PAPER_Marital_DR->CTMAR_Desc)-CHARINDEX('(', PAPMI_RowId->PAPER_Marital_DR->CTMAR_Desc))-1) "marital_desc",
      //               PAPMI_RowId->PAPER_SocialStatus_DR->SS_Code "Occupation_Code",
      //               PAPMI_RowId->PAPER_SocialStatus_DR->SS_Desc "Occupation_Desc",
      //               PAPMI_RowId->PAPER_MobPhone "mobilephone",
      //               PAPMI_RowId->PAPER_TelH,
      //               PAPMI_RowId->PAPER_TelO,
      //               PAPMI_SecondPhone,
      //         CASE 
      //          WHEN PAPMI_RowId->PAPER_Country_DR->CTCOU_RowId IS NULL 
      //          AND ((PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
      //          OR (PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
      //          OR (PAPMI_RowId->PAPER_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND PAPMI_RowId->PAPER_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
      //          ELSE PAPMI_RowId->PAPER_Country_DR->CTCOU_RowId
      //         END "countryid",
      //               PAPMI_RowId->PAPER_Country_DR->CTCOU_Code "countrycode",
      //               PAPMI_RowId->PAPER_Country_DR->CTCOU_Desc "countrydesc",
      //         CASE
      //          WHEN PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
      //          ELSE  PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code
      //         END "zipcode",
      //           CASE
      //          WHEN PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId IN ('77', '78') THEN null
      //          ELSE PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId
      //         END "province",
      //               PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_Desc "provincedesc",
      //         CASE
      //          WHEN PAPMI_RowId->PAPER_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IN ('1116', '936') THEN null
      //          ELSE  PAPMI_RowId->PAPER_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId
      //         END "district",
      //               PAPMI_RowId->PAPER_Zip_DR->CTZIP_CITY_DR->CTCIT_Desc "districtdesc",
      //               PAPMI_CityArea_DR->CITAREA_RowId "subdistrictcid",
      //               PAPMI_CityArea_DR->CITAREA_Desc "subdistrictdesc",
      //               PAPMI_RowId->PAPER_StName "address",
      //         PAPMI_RowId->PAPER_AgeYr "age",
      //         CASE
      //             WHEN PAPMI_RowId->PAPER_AgeYr >= 15 THEN 0
      //              ELSE 1
      //         END "type",
      //         0 "typeaddress"
      //           FROM PA_PatMas where PAPMI_Name = 'นำพล'`;           
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
      //                     //console.log(results);
      //                   });
      //                   console.log(resultset);
      //                   //console.log(results);
      //                   console.log(err);
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
      //   });
      // });
      
      // console.log(result)
      
      // //let result = await cache.query(query)
      // //console.log(result)
      // //await result.map((d: any) => d.Desc = this.Capitalize(d.Desc.toLowerCase()))
      // res.send(result) 
    }
  }
  getNationality() {
    return async (req: Request, res: Response) => {
      let { language, id } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Nation `
      if (id && id !== 'undefined' && id != null) query += ` Where ID = ${id}`
      query += ` ORDER BY CASE WHEN Desc_EN = 'THAI' THEN '1' ELSE Desc_EN END ASC`
      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Code": d.Code,
          "Desc": language == 'th' ? d.Desc_TH : d.Desc_EN,
        }
      })
      res.send(response) 
    }
  }
  getGender() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Sex`
      if (id && id !== 'undefined' && id != null) query += ` Where ID = ${id}`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getReligion() {
    return async (req: Request, res: Response) => {
      let { language, id } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Religion WHERE ID <> 9 `
      if (id && id !== 'undefined' && id != null) query += ` And ID = ${id}`
      query += ` ORDER BY CASE WHEN Desc_EN = 'Buddhism' THEN '1' ELSE Desc_EN END ASC`
      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Desc": language == 'th' ? d.Desc_TH : d.Desc_EN,
        }
      })
      res.send(response) 
    }
  }
  getPreferredLanguage() {
    return async (req: Request, res: Response) => {
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_PreferredLanguage`
      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Desc": language == 'th' ? d.Desc_TH : d.Desc_EN,
        }
      })
      res.send(response) 
    }
  }
  getCountry() {
    return async (req: Request, res: Response) => {
      let { language, id } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Country Where Active = 'Y'`
      if (id && id !== 'undefined' && id != null) query += ` And ID = ${id}`
      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Code": d.Code,
          "Desc": language == 'th' ? d.Desc_TH : d.Desc_EN,
        }
      })
      res.send(response) 
    }
  }
  getZip() {
    return async (req: Request, res: Response) => {
      let { zip, type } = req.query
      let repos = di.get('repos')
      let query = ''
      if ( type == '1' ) {
        query = `SELECT ca.*, c.Province_ID FROM Registration.CT_CityArea_1 ca
                Left Join Registration.CT_City_1 c ON ca.City_ID = c.ID
                Where ca.Zip_Code <> '0' And ca.Zip_Code = '${zip}'`
      } else {
        query = `SELECT ca.*, c.Province_ID FROM Registration.CT_CityArea_1 ca
                Left Join Registration.CT_City_1 c ON ca.City_ID = c.ID
                Where ca.Zip_Code <> '0' And ca.Zip_Code LIKE '%${zip}%'`
                
      }
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getProvince() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT * FROM Registration.CT_Province_1 WHERE Code NOT IN ('999', '900') AND ID = '${id}'`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCityArea() {
    return async (req: Request, res: Response) => {
      let { zip, lang, id } = req.query
      let repos = di.get('repos')
      let query = ''
      
      query = `SELECT ca.* FROM Registration.CT_CityArea_1 ca 
                
              WHERE ca.Zip_Code NOT IN ('999999', '900000') AND ca.Zip_Code = '${zip}'`
      
      if (id && id !== 'undefined' && id != null) query += ` AND ca.ID = ${id}`     
      query += ` GROUP BY ca.ID`
      let result = await repos.query(query)
      let response: any
      if (lang == 'th') {
        response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Zip_Code: d.Zip_Code,
            Desc: d.Desc_TH,
            City_ID: d.City_ID
          }
        })
      } else {
         response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Zip_Code: d.Zip_Code,
            Desc: d.Desc_EN,
            City_ID: d.City_ID
          }
        })
      }
      res.send(response) 
    }
  }
  getRelation() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      
      let query = `SELECT * FROM Registration.CT_Relation`
      if (id && id !== 'undefined' && id != null) query += ` Where ID = ${id}`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getHistoryRelation() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Relation WHERE ActiveFamilyHistory = 1`
      if (id && id !== 'undefined' && id != null) query += ` And ID = ${id}`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getHistoryDisease() {
    return async (req: Request, res: Response) => {
      let { id, language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Diseases WHERE ActiveFamilyHistory = 1 `
      if (id && id !== 'undefined' && id != null) query += ` And ID = ${id}`
      let result = await repos.query(query)
      let response: any
      if (language == 'th') {
        response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Desc: d.DescTH,
          }
        })
      } else {
         response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Desc: d.DescEN,
          }
        })
      }
      res.send(response) 
    }
  }
  getCityByIdArea() {
    return async (req: Request, res: Response) => {
      let {  id } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT c.* FROM Registration.CT_CityArea_1 ca
               RIGHT JOIN Registration.CT_City_1 c ON ca.CITY_ID = c.ID
               WHERE ca.ID = '${id}'`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getTest() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.Patient_Social;`
      let result = await repos.query(query)
      let data = result.map((d: any) => {
        let data = {
          id: d.PatientID,
          data: JSON.parse(d.Detail)
        }
        return data
      })
      res.send(data) 
    }
  }
  getLocationByIdHospital() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT ID, CTLOC_Code, CTLOC_Desc, CTLOC_Floor, CTLOC_Hospital_DR FROM Registration.CT_Loc
               WHERE CTLOC_Hospital_DR = ${id}`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getSignature() {
    return async (req: Request, res: Response) => {
      let { id, type } = req.query
      let repos = di.get('repos')
      
      let query = `SELECT Signature, Createdate, Createtime FROM Registration.Signature Where PatientID = ${id} And SignType = '${type}' Order By ID Desc`
      let result = await repos.query(query)
      result[0].Createdate.setHours(result[0].Createdate.getHours() + 7);
      
      res.send(result) 
    }
  }
  getConsent() {
    return async (req: Request, res: Response) => {
      let { language } = req.query
      let repos = di.get('repos')
      
      let query = `SELECT * FROM Registration.CT_Consent Where Status = 'Active'`
      
      let result = await repos.query(query)
      let response: any
      if (language == 'th') {
        response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Clause: d.Clause,
            Desc: d.MessageHtmlTH,
          }
        })
      } else {
         response = await result.map((d: any) => {
          return {
            ID: d.ID,
            Clause: d.Clause,
            Desc: d.MessageHtmlEN,
          }
        })
      }
      
      res.send(response) 
    }
  }
}

const router = Router()
const route = new ctRoute()

router
  .get("/title", route.getTitle())
  .get("/nationality", route.getNationality())
  .get("/gender", route.getGender())
  .get("/religion", route.getReligion())
  .get("/preferredlanguage", route.getPreferredLanguage())
  .get("/country", route.getCountry())
  .get("/test", route.getTest())
  .get("/zip", route.getZip())
  .get("/province", route.getProvince())
  .get("/cityarea", route.getCityArea())
  .get("/citybyidarea", route.getCityByIdArea())
  .get("/location", route.getLocationByIdHospital())
  .get("/relation", route.getRelation())
  .get("/historyrelation", route.getHistoryRelation())
  .get("/historydisease", route.getHistoryDisease())
  .get("/getsignature", route.getSignature())
  .get("/consent", route.getConsent())
  
export const ct = router