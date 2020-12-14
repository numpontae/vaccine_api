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
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Diseases WHERE ActiveFamilyHistory = 1 `
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
      
      let query = `SELECT Signature, Createdate, ADDTIME(Createtime, '7:00:00') as Createtime FROM Registration.Signature Where PatientID = ${id} And SignType = '${type}' Order By ID Desc`
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