import { Request, Response, Router } from 'express'
import { di } from '../di'
import * as _ from 'lodash'
import axios from 'axios'

class registrationRoute {
  Capitalize = (s: any ) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  postRegister() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get('repos')
      let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${body.religion}`
    let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.gender}`
      let Subdistrict = async (id: any) => {
        let querySubdistrict = `SELECT * FROM Registration_drivethru.CT_Cityarea WHERE ID = ${id}`
        let subdistrict = await repos.query(querySubdistrict)
        if (!subdistrict.length) return null
        return subdistrict[0].Desc
      }
      let District = async (id: any) => {
        let queryDistrict = `SELECT * FROM Registration_drivethru.CT_City WHERE ID = ${id}`
        let district = await repos.query(queryDistrict)
        if (!district.length) return ''
        return district[0].Desc
      }
      let Province = async (id: any) => {
        let queryProvince = `SELECT * FROM Registration_drivethru.CT_Province WHERE ID = ${id}`
        let provice = await repos.query(queryProvince)
        if (!provice.length) return ''
        return provice[0].Desc
      }
      
      let Title = async (id: any) => {
        let queryTitle = `SELECT * FROM Registration.CT_Title Where ID = ${id}`
        let title = await repos.query(queryTitle)
        if (!title.length) return null
        return title[0].Desc
      }
      let Zipcode = async (id: any) => {
        let queryTitle = `SELECT * FROM Registration.CT_Zip Where ID = ${id}`
        let title = await repos.query(queryTitle)
        if (!title.length) return null
        return title[0].Zip_Code
      }
      body.dob = body.dob.slice(6,10) + "/" + body.dob.slice(3,5) + "/" + body.dob.slice(0,2)
      //body.dob = body.dob.replace(/./g, "/")
      let dob = new Date(body.dob)
      dob.setHours(dob.getHours() + 7)
      let Religion = await repos.query(queryReligion)
      let Gender = await repos.query(queryGender)

      let dataInfo = {
        Title: body.title,
        FirstName: body.firstname,
        LastName: body.lastname,
        DOB: `${dob.getFullYear()}-${("0" + (dob.getMonth() + 1)).slice(-2)}-${("0" + dob.getDate()).slice(-2)}`,
        Gender: body.gender,
        Religion: body.religion,
        NationalID: body.national_id,
        PhoneNo: body.phone_no,
        Address: body.address,
        Province: body.province,
        District: body.district,
        Subdistrict: body.subdistrict,
        Zipcode: body.zipcode,
        IsMedical: 1
      }
      let queryInfo = `INSERT INTO Registration_drivethru.Patient_Data SET ?`
      let insertInfo = await repos.query(queryInfo, dataInfo);

      let rpa:any = {
              "data":{
              "server": "http://10.104.10.109/base/web",
              "server_type": "test",
              "id_patient_information":126,
              "patient_code":"9xkevj",
              "hn": null,
              "title_th": await Title(body.title), //(this.title),
              "firstname_th": body.firstname,
              "middlename_th": null,
              "lastname_th": body.lastname,
              "title_en":null,
              "firstname_en":null,
              "middlename_en":null,
              "lastname_en":null,
              "nationality": "Thai",
              "religion": body.religion,
              "religion_desc": Religion[0].Desc_TH,
              "religion_desc_en": Religion[0].Desc_EN,
              "national_id":body.national_id,
              "passport_id":null,
              "dob": dob,
              "age":null,
              "gender": body.gender,
              "gender_desc_en": Gender[0].Desc_EN,
              "gender_desc_th": Gender[0].Desc_TH,
              "marital_status": null,
              "preferrend_language": "Thai",
              "occupation":null,
              "mobile_phone": body.phone_no,
              "email":null,
              "home_telephone":null,
              "office_telephone":null,
              "permanent_address": body.address,
              "permanent_sub_district": await Subdistrict(body.subdistrict),
              "permanent_district": await District(body.district),
              "permanent_province": await Province(body.province),
              "permanent_postcode": await Zipcode(body.zipcode),
              "permanent_country": "Thailand",
              "same_permanent": 0,
              "present_address":null,
              "present_sub_district":null,
              "present_district":null,
              "present_province":null,
              "present_postcode":null,
              "present_country":null,
              "ec_firstname":null,
              "ec_lastname":null,
              "ec_relationship": null,
              "ec_relationship_other": null,
              "ec_telephone": null,
              "e_home_telephone":null,
              "ec_email":null,
              "ec_address_same_patient": null,
              "ec_address":null,
              "ec_sub_district":null,
              "ec_district":null,
              "ec_province":null,
              "ec_postcode":null,
              "ec_country":null,
              "fi_payment_method":null,
              "fi_company":null,
              "date_created":null,
              "date_updated":null,
              "social_list": null,
              "family_list": null,
              "site": "SNH",
              "location": null,
              "Truama":"No",
              "ARI":"No",
              "location_register": "1-Medical Record Department",
              "access_profile": "Registration Staff"
              }
            }
          let time = new Date();
          const filename = `RPA_Register_${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}_${time.getTime()}.txt`
          const path = '/Process'
          delete axios.defaults.baseURL
          axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa  })
          
      res.send({message: 'Sucess'})
      
    }
  }
  getTitle() {
    return async (req: Request, res: Response) => {
      
      let repos = di.get('repos')
      let query = `SELECT * FROM Registration_drivethru.CT_Title`
      query += ` Where Code IN ('00008', '00010', '00116', '00117', '00118') UNION
      SELECT * FROM Registration.CT_Title ct WHERE Code NOT LIKE '%E%' AND CODE NOT IN ('00008', '00010', '00116', '00117', '00118')`
      
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
      query = `SELECT ca.* FROM Registration_drivethru.CT_City ca 
                
              WHERE ca.Province_ID = '${provinceid}' `
      
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
      
      query = `SELECT ca.* FROM Registration_drivethru.CT_Cityarea ca 
                
              WHERE ca.City_ID = '${cityid}'`

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
      query = `SELECT *  FROM Registration_drivethru.CT_Zip 
              Where Province_ID = '${provinceid}' AND City_ID = '${cityid}' AND Cityarea_ID = '${cityareaid}' `
              
      let result = await repos.query(query)
      res.send(result) 
    }
  }
  
  
  
}

const router = Router()
const route = new registrationRoute()

router
  .post("/", route.postRegister())

  
  
export const registration = router