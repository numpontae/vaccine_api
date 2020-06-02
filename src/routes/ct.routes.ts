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
          "Id": d.Id,
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

export const ct = router