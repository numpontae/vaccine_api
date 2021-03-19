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
      let query = `SELECT * FROM Registration_drivethru.CT_Title`
      query += ` Where Code IN ('00008', '00010', '00116', '00117', '00118', '00039')`
      let result = await repos.query(query)
      await result.map((d: any) => d.Desc = this.Capitalize(d.Desc.toLowerCase()))
      
      res.send(result) 
      
    }
  }
  getGender() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration_drivethru.CT_Sex`
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  getReligion() {
    return async (req: Request, res: Response) => {
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration_drivethru.CT_Religion WHERE ID = 4 UNION 
       SELECT * FROM Registration_drivethru.CT_Religion WHERE ID != 10 AND ID != 4 `

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
      query = `SELECT * FROM Registration_drivethru.CT_Province WHERE Code NOT IN ('999', '900') `
      
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  
  
  getCity() {
    return async (req: Request, res: Response) => {
      let { provinceid } = req.query
      let repos = di.get('repos')
      let query = ''
      query = `SELECT ca.* FROM Registration_drivethru.CT_City ca `
      
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
      
      query = `SELECT ca.* FROM Registration_drivethru.CT_Cityarea ca `
      
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
      query = `SELECT *  FROM Registration_drivethru.CT_Zip `

      if(!_.isEmpty(provinceid) && !_.isEmpty(cityid) && !_.isEmpty(cityareaid))
      query +=`Where Province_ID = '${provinceid}' AND City_ID = '${cityid}' AND Cityarea_ID = '${cityareaid}' `
              
      let result = await repos.query(query)
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
  
  
  
}

const router = Router()
const route = new ctRoute()

router
  .get("/title", route.getTitle())
  .get("/gender", route.getGender())
  .get("/religion", route.getReligion())
  .get("/zip", route.getZip())
  .get("/province", route.getProvince())
  .get("/city", route.getCity())
  .get("/cityarea", route.getCityArea())
  .get("/nationality", route.getNationality())
  .get("/country", route.getCountry())
  
  
export const ct = router