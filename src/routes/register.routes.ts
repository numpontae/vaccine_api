import { Request, Response, Router, query } from "express";
import { di } from "../di";
import * as _ from "lodash";

class registerRoute {
  Capitalize = (s: any) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  postRegister() {
    return async (req: Request, res: Response) => {
      let body = req.body;
      let repos = di.get("repos");
      console.log(body);
      let insertInfo = `INSERT INTO Patient_Info (Title_EN, Firstname_EN, Middlename_EN, Lastname_EN, Title_TH, Firstname_TH, Middlename_TH, Lastname_TH, 
      DOB, Gender, Nationallity, Religion, Preferred_Language, Expatriate, Marital_Status, National_ID, Passport, Occupation, Address, Country, Phone_No, 
      Email, Confirm) 
      VALUES('${body.patient_info.title_en ? body.patient_info.title_en : ''}', '${body.patient_info.firstname_en ? body.patient_info.firstname_en : ''}', 
      '${body.patient_info.middlename_en ? body.patient_info.middlename_en : ''}', '${body.patient_info.lastname_en ? body.patient_info.lastname_en : ''}', 
      '${body.patient_info.title_th ? body.patient_info.title_th : ''}', '${body.patient_info.firstname_th ? body.patient_info.firstname_th : ''}', 
      '${body.patient_info.middlename_th ? body.patient_info.middlename_th : ''}', '${body.patient_info.lastname_th ? body.patient_info.lastname_th : ''}', 
      '${body.patient_info.dob}', ${body.patient_info.gender}, ${body.patient_info.nationality}, ${body.patient_info.religion}, ${body.patient_info.preferredlanguage}, 
      '${body.patient_info.expatriate}', '${body.patient_info.marital_status}', '${body.patient_info.national_id ? body.patient_info.national_id : ''}', 
      '${body.patient_info.passport ? body.patient_info.passport : ''}', '${body.patient_info.occupation ? body.patient_info.occupation : ''}', 
      '${body.patient_info.address ? body.patient_info.address : ''}', '${body.patient_info.country}', '${body.patient_info.phone_no ? body.patient_info.phone_no : ''}', 
      '${body.patient_info.email ? body.patient_info.email : ''}', 'N')`;
      let Info = await repos.query(insertInfo);
      let insertEmergency = `INSERT INTO Emergency (Firstname, Lastname, Relation, Address, Phone_No, Email, Patient_ID, Createdate) VALUES('${body.emergency.first_name}', '${body.emergency.last_name}', '${body.emergency.relation}', '${body.emergency.same_address ? body.emergency.address : body.patient_info.address}', '${body.emergency.phone_no}', '${body.emergency.email}', ${Info.insertId}, current_timestamp());`
      await repos.query(insertEmergency);
      let insertFinan = `INSERT INTO Financial (Self_Pay, Company_Contact, Insurance, Payment_As, Patient_ID) VALUES(${_.findIndex(body.financial.payment_method, 'Self pay') >= 0 ? 0 : 1}, ${_.findIndex(body.financial.payment_method, 'Company contact') >= 0 ? 0 : 1}, ${_.findIndex(body.financial.payment_method, 'Insurance') >= 0 ? 0 : 1}, '${body.financial.payment_as}', ${Info.insertId});`
      await repos.query(insertFinan);
      let insertHis = `INSERT INTO Patient_History (Marital_Status, Medication, Surgery, Physical, Exercise, Pregnant, Care_Giver, Authorrize, Allergies, 
      Alcohol, Drug, Smoke, Patient_ID, Createdate) VALUES('${body.personal_history.marital_status ? body.personal_history.marital_status : ''}', '${body.personal_history.medication ? body.personal_history.medication : ''}', 
      '${body.personal_history.surgery ? body.personal_history.surgery : ''}', '${body.personal_history.physical ? body.personal_history.physical : ''}', '${body.personal_history.exercise ? body.personal_history.exercise : ''}', 
      '${body.personal_history.pregnant ? body.personal_history.pregnant : ''}', '${body.personal_history.care_giver ? body.personal_history.care_giver : ''}', '${body.personal_history.authorrize ? body.personal_history.authorrize : ''}', 
      '${body.personal_history.allergies ? body.personal_history.allergies : ''}', '${body.personal_history.alcohol ? body.personal_history.alcohol : ''}', '${body.personal_history.drug ? body.personal_history.drug : ''}', '${body.personal_history.smoke ? body.personal_history.smoke : ''}', ${Info.insertId}, current_timestamp());`
      await repos.query(insertHis);
      if (body.personal_history.diseases.length > 0) {
        let valuesDiseases: any[] = [] 
        body.personal_history.diseases.map((p: any) => {
          let value = [Info.insertId, `${p}`]
          valuesDiseases.push(value) 
        })
        let insertDiseases = `INSERT INTO Patient_Diseases (Patient_ID, Disease) VALUES ?;`
        await repos.query(insertDiseases, [valuesDiseases])
      }
      if (body.personal_history.family.length > 0) {
        let valuesFamily: any[] = [] 
        body.personal_history.family.map((p: any) => {
          let value = [Info.insertId, `${p}`]
          valuesFamily.push(value) 
        })
        let insertFamily = `INSERT INTO Family_History (Patient_ID, Disease) VALUES ?;`
        await repos.query(insertFamily, [valuesFamily])
      }
      
      res.send({message: 'Success'})
    };
  }
  getSearch() {
    return async (req: Request, res: Response) => {
      let {id, firstname, lastname, phone_no, passport, national_id} = req.body;
      let repos = di.get("repos");
      if (_.isEmpty(id)) {
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Patient_Info PI`
        query += ` LEFT JOIN CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` WHERE 1 = 1`
        if (!_.isEmpty(firstname)) {
          query += ` AND (PI.Firstname_EN LIKE '%${firstname}%' OR PI.Firstname_TH LIKE '%${firstname}%')`
        }
        if (!_.isEmpty(lastname)) {
          query += ` AND (PI.Lastname_EN LIKE '%${lastname}%' OR PI.Lastname_TH LIKE '%${lastname}%')`
        }
        if (!_.isEmpty(phone_no)) {
          query += ` AND PI.Phone_No = '${phone_no}'`
        }
        if (!_.isEmpty(passport)) {
          query += ` AND PI.Passport = '${phone_no}'`
        }
        if (!_.isEmpty(national_id)) {
          query += ` AND PI.National_ID = '${phone_no}'`
        }
        let data = await repos.query(query)
        res.send(data)
      } else {
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc, CTN.Desc_EN Nation_Desc, CTR.Desc_EN Religion_Desc, CTP.Desc_EN Lan_Desc FROM Patient_Info PI`
        query += ` LEFT JOIN CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` LEFT JOIN CT_Nation CTN ON CTN.Id = PI.Nationallity`
        query += ` LEFT JOIN CT_Religion CTR ON CTR.Id = PI.Religion`
        query += ` LEFT JOIN CT_PreferredLanguage CTP ON CTP.Id = PI.Preferred_Language`
        query += ` WHERE 1 = 1`
        query += ` AND PI.Id = ${id}`
        let emerQuery = `SELECT * FROM Emergency WHERE Patient_ID = ${id}`
        let finanQuery = `SELECT * FROM Financial WHERE Patient_ID = ${id}`
        let hisQuery = `SELECT * FROM Patient_History WHERE Patient_ID = ${id}`
        let diseasesQuery = `SELECT * FROM Patient_Diseases WHERE Patient_ID = ${id}`
        let familyQuery = `SELECT * FROM Family_History WHERE Patient_ID = ${id}`
        let info = await repos.query(query)
        let emer = await repos.query(emerQuery)
        let finan = await repos.query(finanQuery)
        let his = await repos.query(hisQuery)
        let diseases = await repos.query(diseasesQuery)
        let family = await repos.query(familyQuery)
        let result = {
          info: info,
          emer: emer,
          finan: finan,
          his: his,
          diseases: diseases,
          family: family
        }
        res.send(result)
      }
      
    }
  }
}

const router = Router();
const route = new registerRoute();

router.post("/", route.postRegister())
      .post("/search", route.getSearch())

export const register = router;
