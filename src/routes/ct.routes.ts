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
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Title`
      if (language == 'th') query += ` Where Code IN ('00008', '00010', '00116', '00117', '00118')`
      if (language == 'en') query += ` Where Code IN ('00008e', '00116e', '00010E', '00118e')`
      let result = await repos.query(query)
      await result.map((d: any) => d.Desc = this.Capitalize(d.Desc.toLowerCase()))
      res.send(result) 
    }
  }
  getNationality() {
    return async (req: Request, res: Response) => {
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Nation ORDER BY CASE WHEN Desc_EN = 'THAI' THEN '1' ELSE Desc_EN END ASC`
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
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Sex`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getReligion() {
    return async (req: Request, res: Response) => {
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Religion WHERE ID <> 9 ORDER BY CASE WHEN Desc_EN = 'Buddhism' THEN '1' ELSE Desc_EN END ASC`
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
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_PreferredLanguage`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCountry() {
    return async (req: Request, res: Response) => {
      let { language } = req.query
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Country Where Active = 'Y'`
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
      let { zip, lang } = req.query
      let repos = di.get('repos')
      let query = ''
      
      query = `SELECT ca.* FROM Registration.CT_CityArea_1 ca
              WHERE ca.Zip_Code NOT IN ('999999', '900000') AND ca.Zip_Code = '${zip}'
              GROUP BY ca.ID`
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
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Relation`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getHistoryRelation() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Relation WHERE ActiveFamilyHistory = 1`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getHistoryDisease() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration.CT_Diseases WHERE ActiveFamilyHistory = 1`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCityByIdArea() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
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

export const ct = router