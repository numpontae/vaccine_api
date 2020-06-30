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
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_Title`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getNationality() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_Nation ORDER BY CASE WHEN Desc_EN = 'THAI' THEN '1' ELSE Desc_EN END ASC`
      let result = await repos.query(query)
      let response = result.map((d:any ) => {
        return {
          "ID": d.ID,
          "Code": d.Code,
          "Desc_EN": this.Capitalize(d.Desc_EN.toLowerCase()),
          "Desc_TH": d.Desc_TH
        }
      })
      res.send(response) 
    }
  }
  getGender() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_Sex`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getReligion() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_Religion ORDER BY CASE WHEN Desc_EN = 'Buddhism' THEN '1' ELSE Desc_EN END ASC`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getPreferredLanguage() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_PreferredLanguage`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCountry() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM CT_Country Where Active = 'Y'`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getZip() {
    return async (req: Request, res: Response) => {
      let { zip, type } = req.query
      let repos = di.get('repos')
      let query = ''
      if ( type == '1' ) {
        query = `SELECT * FROM CT_Zip Where Zip_Code NOT IN ('JAN-64', 'AUG-43', '999999', '') AND Zip_Code = '${zip}'`
      } else {
        query = `SELECT * FROM CT_Zip Where Zip_Code NOT IN ('JAN-64', 'AUG-43', '999999', '') AND Zip_Code LIKE '%${zip}%'`
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
      query = `SELECT * FROM CT_Province WHERE Code NOT IN ('999', '900') AND ID = '${id}'`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCityArea() {
    return async (req: Request, res: Response) => {
      let { zip } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT ca.* FROM CT_Zip z
              RIGHT JOIN CT_CityArea ca ON ca.ID = z.Cityarea_ID
              WHERE ca.Code NOT IN ('999999', '900000') AND z.Zip_Code = '${zip}'
              GROUP BY ca.ID`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getCityByIdArea() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT c.* FROM CT_CityArea ca
               RIGHT JOIN CT_City c ON ca.CITY_ID = c.ID
               WHERE ca.ID = '${id}'`
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getTest() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Patient_Social;`
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

export const ct = router