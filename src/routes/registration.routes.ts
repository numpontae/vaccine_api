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
      try {
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
        CardPicture: body.id_card,
        PaymentCash: body.payment_method.includes("Cash") ? 1 : 0,
        PaymentCreditcard: body.payment_method.includes("Credit card") ? 1 : 0,
        PaymentCompany: body.payment_method.includes("Company bill") ? 1 : 0,
        PaymentMobile: body.payment_method.includes("Mobile") ? 1 : 0,
        paymentInsurance: body.payment_method.includes("Insurance") ? 1 : 0,
        PaymentOther: body.payment_method.includes("Other") ? 1 : 0,
        PaymentCompanyDesc: body.paymentCompany,
        PaymentInsuranceDesc: body.paymentInsurance,
        PaymentOtherDesc: body.paymentOther,
        Fever14: body.fever14 == "yes" ? 1 : 0, 
        Symptom14_Cough: body.symptom14.includes("Cough") ? 1 : 0,
        Symptom14_RunnyNose: body.symptom14.includes("Runny nose") ? 1 : 0,
        Symptom14_SoreThroat: body.symptom14.includes("Sore throat") ? 1 : 0,
        Symptom14_RapidBreathing: body.symptom14.includes("Rapid breathing") ? 1 : 0,
        Symptom14_DifficultyBreathing: body.symptom14.includes("Difficulty breathing") ? 1 : 0,
        Symptom14_NoseDoesNotSmell: body.symptom14.includes("Nose does not smell") ? 1 : 0,
        Symptom14_TiredBreathing: body.symptom14.includes("Tired breathing") ? 1 : 0,
        Symptom14_TonguesArePerceivedWrong: body.symptom14.includes("Tongues are perceived wrong") ? 1 : 0,
        Symptom14_NoneOfTheAbove: body.symptom14.includes("None of the above") ? 1 : 0,
        Travelscourgecovid30: body.travelscourgecovid30 == "yes" ? 1 : 0,
        Staycovid30: body.staycovid30 == "yes" ? 1 : 0,
        Workcovid30: body.workcovid30 == "yes" ? 1 : 0,
        Traveldoubtcovid30: body.traveldoubtcovid30 == "yes" ? 1 : 0,
        IsMedical: body.is_medical == "yes" ? 1 : 0,
        PublicIP: body.publicip,
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
          
      res.send({message: 'Sucess', status: '200'})
    } catch (error) {
      console.log(error);
      res.send({message: 'Error', status: '404'})
      console.log("error")
    }
    }
  } 
  getCardPicture() {
    return async (req: Request, res: Response) => {
      let { id } = req.query
      let repos = di.get('repos')
      let query = ''
      
      query = `SELECT CardPicture FROM Registration_drivethru.Patient_Data WHERE ID = '${id}'  `

              
      let result = await repos.query(query)

      res.send(result) 
    }
  }
  getSearch() {
    return async (req: Request, res: Response) => {
      
      let {id, firstname, lastname, phone_no, passport, dateOfBirth, national_id, site, page} = req.body;
      
      let repos = di.get("repos");
      try {
        
        let startNum = (parseInt(page) * 15) - 15
        let LimitNum = 15
        if (_.isEmpty(id) && !_.isNumber(id)) {
          let query = `SELECT PD.ID, PD.FirstName, PD.LastName, PD.DOB,PD.NationalID, CTS.Desc AS Gender_Desc FROM Registration_drivethru.Patient_Data PD`
          query += ` LEFT JOIN Registration_drivethru.CT_Sex CTS ON CTS.Id = PD.Gender`
          // if (!_.isEmpty(firstname)) {
          //   query += ` AND (PI.Firstname LIKE '%${firstname}%')`
          // }
          // if (!_.isEmpty(lastname)) {
          //   query += ` AND (PI.Lastname LIKE '%${lastname}%')`
          // }
          // if (!_.isEmpty(phone_no)) {
          //   query += ` AND PI.PhoneNo = '${phone_no}'`
          // }
          // if (!_.isEmpty(passport)) {
          //   query += ` AND PI.Passport = '${passport}'`
          // }
          // if (!_.isEmpty(national_id)) {
          //   query += ` AND PI.NationalID = '${national_id}'`
          // }
          // if (!_.isEmpty(dateOfBirth)) {
          //   query += ` AND (PI.DOB = '${dateOfBirth}')`
          // }
          
          query += ` ORDER BY PD.ID DESC LIMIT ${startNum},${LimitNum}`
          let queryCount = `SELECT COUNT(PD.ID) as count FROM Registration_drivethru.Patient_Data PD`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          
          await data.map((d: any) => {
            //let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
            //return d.UID = encrypted.toString()
          })
          const result = {
            pagination:{
              currentPage: parseInt(page),
              totalPage: Math.ceil(count[0].count/15),
              totalResult: count[0].count
            },
            result: data
          }
          res.send(result)
        } else {
          // let decrypted = await CryptoJS.AES.decrypt(id, "C36bJmRax7")
          // let uid = decrypted.toString(CryptoJS.enc.Utf8)
          let data = await this.getPatientByIdFromDB(id)
          
          res.send(data)
          
        }
      } catch (error) {
        console.log(error);
        res.status(404).json([])
      }
    }
  }
  async getPatientByIdFromDB(id: string) {
    let repos = di.get("repos");
    let query = `SELECT PD.* FROM Registration_drivethru.Patient_Data PD`
    query += ` WHERE PD.ID = '${id}'`
    let data = await repos.query(query)

    let payment = []
    if (data[0].PaymentCash == 1) payment.push('Cash')
    if (data[0].PaymentCreditcard == 1) payment.push('Credit card')
    if (data[0].PaymentCompany == 1) payment.push('Company bill')
    if (data[0].PaymentMobile == 1) payment.push('Mobile')
    if (data[0].PaymentOther == 1) payment.push('Other')

    let symptom14 = []
    if (data[0].Symptom14_Cough == 1) symptom14.push('Cough')
    if (data[0].Symptom14_RunnyNose == 1) symptom14.push('Runn nose')
    if (data[0].Symptom14_SoreThroat == 1) symptom14.push('Sore throat')
    if (data[0].Symptom14_RapidBreathing == 1) symptom14.push('Rapid breathing')
    if (data[0].Symptom14_DifficultyBreathing == 1) symptom14.push('Difficulty breathing')
    if (data[0].Symptom14_NoseDoesNotSmell == 1) symptom14.push('Nose does not smell')
    if (data[0].Symptom14_TiredBreathing == 1) symptom14.push('Tired breathing')
    if (data[0].Symptom14_TonguesArePerceivedWrong == 1) symptom14.push('Tongues are perceived wrong')
    if (data[0].Symptom14_NoneOfTheAbove == 1) symptom14.push('None of the above')
    data[0].DOB.setHours(data[0].DOB.getHours() + 7)
    let result = {
      Title: data[0].Title,
      Firstname: data[0].FirstName,
      Lastname: data[0].LastName,
      DOB: data[0].DOB,
      NationalID: data[0].NationalID,
      Religion: data[0].Religion,
      PhoneNo: data[0].PhoneNo,
      Province: data[0].Province,
      District: data[0].District,
      Subdistrict: data[0].SubDistrict,
      Zipcode: data[0].ZipCode,
      Address: data[0].Address,
      Payment_method: payment,
      CardPicture: data[0].CardPicture,
      ShowPaymentCompany: data[0].PaymentCompany == 1 ? true : false,
      ShowPaymentInsurance: data[0].PaymentInsurance == 1 ? true : false,
      ShowPaymentOther: data[0].PaymentOther == 1 ? true : false,
      PaymentCompanyDesc: data[0].PaymentCompanyDesc,
      PaymentInsuranceDesc: data[0].PaymentInsuranceDesc,
      PaymentOtherDesc: data[0].PaymentOtherDesc,
      Symptom14: symptom14,
      Fever14: data[0].Fever14 == 1 ? "yes" : "no",
      Travelscourgecovid30: data[0].Travelscourgecovid30 == 1 ? "yes" : "no",
      Staycovid30: data[0].Staycovid30 == 1 ? "yes" : "no",
      Workcovid30: data[0].Workcovid30 == 1 ? "yes" : "no",
      Traveldoubtcovid30: data[0].Traveldoubtcovid30== 1 ? "yes" : "no",
      IsMedical: data[0].IsMedical == 1 ? "yes" : "no",
    }
      
    return result
    
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
  .post("/search", route.getSearch())
  .get("/cardpicture", route.getCardPicture())

  
  
export const registration = router