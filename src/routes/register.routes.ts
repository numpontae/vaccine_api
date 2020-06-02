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
      console.log(_.indexOf(body.financial.payment_method, 'Self pay'));
      let insertInfo = `INSERT INTO Patient_Info (Title, Firstname, Middlename, Lastname, 
      DOB, Gender, Nationality, Religion, Preferred_Language, Expatriate, Marital_Status, National_ID, Passport, Occupation, Address, Country, Phone_No, 
      Email, Confirm, Consent) 
      VALUES('${body.patient_info.title ? body.patient_info.title : ''}', '${body.patient_info.firstname ? body.patient_info.firstname : ''}', 
      '${body.patient_info.middlename ? body.patient_info.middlename : ''}', '${body.patient_info.lastname ? body.patient_info.lastname : ''}', 
      '${body.patient_info.dob}', ${body.patient_info.gender}, ${body.patient_info.nationality}, ${body.patient_info.religion}, ${body.patient_info.preferredlanguage}, 
      '${body.patient_info.expatriate}', '${body.patient_info.marital_status}', '${body.patient_info.national_id ? body.patient_info.national_id : ''}', 
      '${body.patient_info.passport ? body.patient_info.passport : ''}', '${body.patient_info.occupation ? body.patient_info.occupation : ''}', 
      '${body.patient_info.address ? body.patient_info.address : ''}', '${body.patient_info.country}', '${body.patient_info.phone_no ? body.patient_info.phone_no : ''}', 
      '${body.patient_info.email ? body.patient_info.email : ''}', 'N', 'Y')`;
      let Info = await repos.query(insertInfo);
      let insertEmergency = `INSERT INTO Emergency (Firstname, Lastname, Relation, Address, Phone_No, Email, Patient_ID, Createdate, Different_Address) VALUES('${body.emergency.first_name}', '${body.emergency.last_name}', '${body.emergency.relation}', '${body.emergency.same_address ? body.emergency.address : body.patient_info.address}', '${body.emergency.phone_no}', '${body.emergency.email}', ${Info.insertId}, current_timestamp(), ${body.emergency.same_address ? 0 : 1});`
      await repos.query(insertEmergency);
      let insertFinan = `INSERT INTO Financial (Self_Pay, Company_Contact, Insurance, Payment_As, Patient_ID) VALUES(${_.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 0 : 1}, ${_.indexOf(body.financial.payment_method, 'Company contact') >= 0 ? 0 : 1}, ${_.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 0 : 1}, '${body.financial.payment_as}', ${Info.insertId});`
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
      if (_.isEmpty(id) && !_.isNumber(id)) {
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
        query += ` AND Confirm != 'Y'`
        let data = await repos.query(query)
        res.send(data)
      } else {
        //let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc, CTN.Desc_EN Nation_Desc, CTR.Desc_EN Religion_Desc, CTP.Desc_EN Lan_Desc FROM Patient_Info PI`
        let query = `SELECT PI.Title title, PI.Firstname firstname, PI.Middlename middlename, PI.Lastname lastname, PI.DOB dob, PI.Gender gender, PI.Nationality nationality, PI.Religion religion, PI.Preferred_Language preferredlanguage, PI.Expatriate expatriate, PI.Marital_Status marital_status, PI.National_ID national_id, PI.Passport passport, PI.Occupation occupation, PI.Address address, PI.Country country, PI.Phone_No phone_no, PI.Email email FROM Patient_Info PI`
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
        let payment = []
        let diseaseslist: any = []
        let familylist: any = []
        if (finan.length) {
          if (finan[0].Self_Pay == 0) payment.push('Self pay')
          if (finan[0].Company_Contact == 0) payment.push('Company contact')
          if (finan[0].Insurance == 0) payment.push('Insurance')
        }
        diseases.map((d:any) => {
          diseaseslist.push(d.Disease)
        })
        family.map((d:any) => {
          familylist.push(d.Disease)
        })
        let result = {
          info: info,
          emer: emer,
          finan: {
            payment:payment,
            payment_as: finan[0].Payment_As
          },
          his: his,
          diseases: diseaseslist,
          family: familylist
        }
        res.send(result)
      }
      
    }
  }
  saveSignature() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, id, consent } = req.body;
      console.log(req.body)
      let repos = di.get("repos");
      let query = `UPDATE Patient_Info SET Confirm='Y' WHERE Id=${id};`
      let insertSignature = `INSERT INTO Signature (Patient_ID, Hash_Data, Image) VALUES(${id}, '${signatureHash}', '${signatureImage}');`
      await repos.query(query)
      await repos.query(insertSignature)
      res.send({message: 'Success'})
    }
  }
}

const router = Router();
const route = new registerRoute();

router.post("/", route.postRegister())
      .post("/search", route.getSearch())
      .post("/signature", route.saveSignature())

export const register = router;
