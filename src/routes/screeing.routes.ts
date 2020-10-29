import { Request, Response, Router } from "express";
import { di } from "../di";
import * as _ from "lodash";
import CryptoJS from "crypto-js";
const axios = require('axios');
import { rpaSetting } from "../config/config";

class screeningRoute {
  async getPatientByHN(hn: any) {
    let repos = di.get("repos");
    let query = `SELECT PI.* FROM Screening.Patient_Info PI`
    query += ` WHERE 1 = 1`
    query += ` AND PI.HN = '${hn}'`
    let info = await repos.query(query)
    if (info[0].Type == 0) {
      let queryAddress = `SELECT * FROM Screening.Patient_Address WHERE HN = '${hn}' ORDER BY Type`
      let queryEmergency = `SELECT * FROM Screening.Patient_Emergency WHERE HN = '${hn}'`
      let address = await repos.query(queryAddress)
      let emergency = await repos.query(queryEmergency)
      let filterpermanent: any[] = await address.filter((d:any) => d.Type == 0)
      console.log(address)
      let familylist: any = []
      let dataSocial: any = []
      let result = {
        Info: info[0],
        Permanent: filterpermanent[0],
        Emergency: {
          Firstname: emergency.length ? emergency[0].Firstname : null,
          Lastname: emergency.length ? emergency[0].Lastname : null,
          Relation: emergency.length ? emergency[0].Relation : null,
          sameAddress: emergency.length ? emergency[0].sameAddress : null,
          Country: emergency.length ? emergency[0].Country : null,
          Province: emergency.length ? emergency[0].Province : null,
          Postcode: emergency.length ? emergency[0].Postcode : null,
          Subdistrict: emergency.length ? emergency[0].Subdistrict : null,
          District: emergency.length ? emergency[0].District : null,
          Address: emergency.length ? emergency[0].Address : null,
          PhoneNo: emergency.length ? emergency[0].PhoneNo : null,
          Email: emergency.length ? emergency[0].Email : null,
        },
        Financial: {
          payment_method: [],
          showInsurance: false,
          showCompany: false,
          InsuranceDesc: null,
          CompanyDesc: null,
          PaymentAs: null,
          Title: null,
          Firstname: null,
          Lastname: null,
          DOB: null,
          Aforemention: null,
        },
        Family: familylist,
        SocialHistory: dataSocial
      }
      return result
    }
  }
  saveSignature() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, id, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Screening.Patient_Info SET Confirm=1 WHERE HN='${id}';`
      let insertSignature = `INSERT INTO Screening.Signature (HN, HashSiganture, Signature, SignType, Consent) VALUES('${id}', '${signatureHash}', '${signatureImage}', '${signType}', "${consentText}");`
      await repos.query(query)
      await repos.query(insertSignature)
      res.send({message: 'Success'})
    }
  }
  
  saveSignatureApprove() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, id, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Screening.Patient_Info SET Approve=1 WHERE HN='${id}';`
      let insertSignature = `INSERT INTO Screening.Signature (HN, HashSiganture, Signature, SignType, Consent) VALUES('${id}', '${signatureHash}', '${signatureImage}', '${signType}', "${consentText}");`
      await repos.query(query)
      await repos.query(insertSignature)
      res.send({message: 'Success'})
    }
  }
  
  getSearch() {
    return async (req: Request, res: Response) => {
      let {id, firstname, lastname, phone_no, passport, national_id, dateOfBirth, page} = req.body;
      let repos = di.get("repos");
      try {
        let startNum = (parseInt(page) * 15) - 15
        let LimitNum = 15
        if (_.isEmpty(id) && !_.isNumber(id)) {
          let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Screening.Patient_Info PI`
          query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
          query += ` WHERE 1 = 1`
          if (!_.isEmpty(firstname)) {
            query += ` AND (PI.Firstname LIKE '%${firstname}%')`
          }
          if (!_.isEmpty(lastname)) {
            query += ` AND (PI.Lastname LIKE '%${lastname}%')`
          }
          if (!_.isEmpty(phone_no)) {
            query += ` AND PI.PhoneNo = '${phone_no}'`
          }
          if (!_.isEmpty(passport)) {
            query += ` AND PI.Passport = '${passport}'`
          }
          if (!_.isEmpty(national_id)) {
            query += ` AND PI.NationalID = '${national_id}'`
          }
          if (!_.isEmpty(dateOfBirth)) {
            query += ` AND (PI.DOB = '${dateOfBirth}')`
          }
          
          query += ` AND Confirm != 1`
          query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          
          let queryCount = `SELECT COUNT(PI.ID) as count FROM Screening.Patient_Info PI`
          queryCount += ` WHERE 1 = 1`
          if (!_.isEmpty(firstname)) {
            queryCount += ` AND (PI.Firstname LIKE '%${firstname}%')`
          }
          if (!_.isEmpty(lastname)) {
            queryCount += ` AND (PI.Lastname LIKE '%${lastname}%')`
          }
          if (!_.isEmpty(phone_no)) {
            queryCount += ` AND PI.PhoneNo = '${phone_no}'`
          }
          if (!_.isEmpty(passport)) {
            queryCount += ` AND PI.Passport = '${passport}'`
          }
          if (!_.isEmpty(national_id)) {
            queryCount += ` AND PI.NationalID = '${national_id}'`
          }
          if (!_.isEmpty(dateOfBirth)) {
            queryCount += ` AND (PI.DOB = '${dateOfBirth}')`
          }
          
          queryCount += ` AND Confirm != 1`
          let data = await repos.query(query)
          let count = await repos.query(queryCount)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.HN, 'C36bJmRax7');
            return d.UID = encrypted.toString()
          })
          const result = {
            pagination:{
              currentPage: parseInt(page),
              totalPage: Math.ceil(count[0].count/20),
              totalResult: count[0].count
            },
            result: data
          }
          res.json(result)
        } else {
          let decrypted = await CryptoJS.AES.decrypt(id, "C36bJmRax7")
          let hn = decrypted.toString(CryptoJS.enc.Utf8)
          let data = await this.getPatientByHN(hn)
          res.send(data)
        }
      } catch (error) {
        res.send([])
      }
    }
  }
  updateData() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get("repos");
      let getComment = (type: string, data: any) => {
        if (type == 'alcohol') {
          console.log(data.detail)
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
        } else if (type == 'exercise') {
          return `quantity: ${data.quantity}, comment: ${data.comment}`
        } else if (type == 'smoke') {
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
        }
      }
      if (body.type == 0) {
        let dateDob = new Date(body.patient_info.dob)
        let dataInfo = {
          Title: body.patient_info.title,
          Firstname: body.patient_info.firstname,
          Middlename: body.patient_info.middlename,
          Lastname: body.patient_info.lastname,
          DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
          Gender: body.patient_info.gender,
          Nationality: body.patient_info.nationality,
          Religion: body.patient_info.religion,
          PreferredLanguage: body.patient_info.preferredlanguage,
          Expatriate: body.patient_info.expatriate,
          MaritalStatus: body.patient_info.marital_status,
          NationalID: body.patient_info.national_id,
          Passport: body.patient_info.passport,
          Occupation: body.patient_info.occupation,
          PhoneNo: body.patient_info.phone_no,
          Email: body.patient_info.email,
          Homephone: body.patient_info.homephone,
          Officephone: body.patient_info.officephone
        }
        let queryInfo = `UPDATE Screening.Patient_Info SET ? WHERE HN = '${body.HN}'`
        await repos.query(queryInfo, dataInfo);
        let dataPermanent = {
          HN: body.HN,
          Country: body.permanent.country,
          Postcode: body.permanent.postcode,
          Subdistrict: body.permanent.subdistrict,
          District: body.permanent.districtid,
          Address: body.permanent.address,
          Province: body.permanent.provinceid,
          Type: 0,
          sameAddress: null
        }
        let queryPermanent = `REPLACE INTO Screening.Patient_Address SET ?`
        
        let dataPresent = {
          HN: body.HN,
          Country: body.present.sameAddress ? body.permanent.country : body.present.country,
          Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
          Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
          District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
          Address: body.present.sameAddress ? body.permanent.address : body.present.address,
          Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
          Type: 1,
          sameAddress: body.present.sameAddress
        }
        let queryPresent = `REPLACE INTO Screening.Patient_Address SET ?`
        let dataEmergency = {
          HN: body.HN,
          Firstname: body.emergency.first_name,
          Lastname: body.emergency.last_name,
          Relation: body.emergency.relation,
          Email: body.emergency.email,
          PhoneNo: body.emergency.phone_no,
          Country: body.emergency.sameAddress ? body.permanent.country : body.emergency.country,
          Postcode: body.emergency.sameAddress ? body.permanent.postcode : body.emergency.postcode,
          Subdistrict: body.emergency.sameAddress ? body.permanent.subdistrict : body.emergency.subdistrict,
          District: body.emergency.sameAddress ? body.permanent.districtid : body.emergency.districtid,
          Address: body.emergency.sameAddress ? body.permanent.address : body.emergency.address,
          Province: body.emergency.sameAddress ? body.permanent.provinceid : body.emergency.provinceid,
          sameAddress: body.emergency.sameAddress
        }
        let queryEmergency = `REPLACE INTO Screening.Patient_Emergency SET ?`

        let financialDob = new Date(body.financial.dob)
        let dataFinancial = {
          HN: body.HN,
          SelfPay: _.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 1 : 0,
          CompanyContact: _.indexOf(body.financial.payment_method, 'Company contract') >= 0 ? 1 : 0,
          Insurance: _.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 1 : 0,
          CompanyDesc: body.financial.company,
          InsuranceDesc: body.financial.insurance,
          PaymentAs: body.financial.payment_as,
          Title: body.financial.title,
          Firstname: body.financial.firstname,
          Lastname: body.financial.lastname,
          DOB: `${financialDob.getFullYear()}-${("0" + (financialDob.getMonth() + 1)).slice(-2)}-${("0" + financialDob.getDate()).slice(-2)}`,
          Aforemention: body.financial.aforemention,
        }
        let queryFinancial = `INSERT INTO Screening.Patient_Financial SET ?`

        let dataHistory = {
          HN: body.HN,
          MaritalStatus: body.personal_history.marital_status,
          Children: body.personal_history.children,
          Diseases: JSON.stringify(body.personal_history.diseases),
          Medication: body.personal_history.medication,
          CommentMedication: body.personal_history.c_medication,
          Hospitalization: body.personal_history.hospitalization,
          CommentHospitalization: body.personal_history.c_hospitalization,
          Physical: body.personal_history.physical,
          CommentPhysical: body.personal_history.c_physical,
          Exercise: body.personal_history.exercise.status,
          Pregnant: body.personal_history.pregnant,
          CommentPregnant: body.personal_history.c_pregnant,
          Giver: body.personal_history.giver,
          CommentGiver: body.personal_history.c_giver,
          AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
          Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
          GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
          StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
          Authorize: body.personal_history.authorize,
          CommentAuthorize: body.personal_history.c_authorize,
          Spiritual: body.personal_history.spiritual,
          CommentSpiritual: body.personal_history.c_spiritual,
          Allergies: body.personal_history.allergies,
          CommentAllergies: body.personal_history.c_allergies,
          Alcohol: body.personal_history.alcohol.status,
          DrugAbuse: body.personal_history.drugabuse.status,
          Smoke: body.personal_history.smoke.status,
          FatherAlive: body.personal_history.father.alive,
          FatherAge: body.personal_history.father.age,
          CauseFather: body.personal_history.father.cause,
          MotherAlive: body.personal_history.mother.alive,
          MotherAge: body.personal_history.mother.age,
          CauseMother: body.personal_history.mother.cause,
        }
        let queryHistory = `INSERT Screening.Patient_History SET ?`
        await repos.query(queryEmergency, dataEmergency)
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryHistory, dataHistory);
        if (body.personal_history.family.length > 0) {
          let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
          await repos.query(deleteFamily);
          let valuesFamily: any[] = [] 
          body.personal_history.family.map((p: any) => {
            if (p.person != null && p.illness != null) {
              let value = [body.HN, p.person, p.illness]
              valuesFamily.push(value) 
            }
          })
          let insertFamily = `INSERT INTO Screening.Family_History (HN, Person, Disease) VALUES ?;`
          if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
        }
        let deleteSocial = `DELETE FROM Screening.Patient_Social WHERE HN = '${body.HN}'`
        await repos.query(deleteSocial);
        if (body.personal_history.exercise.status != null) {
          let dataExercise = {
            HN: body.HN,
            Habit: 'exercise',
            Status: body.personal_history.exercise.status,
            Quantity: body.personal_history.exercise.quantity,
            Detail: null,
            Comment: body.personal_history.exercise.comment
          }
          let insertExercise = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
          let dataAlcohol = {
            HN: body.HN,
            Habit: 'alcohol',
            Status: body.personal_history.alcohol.status,
            Quantity: body.personal_history.alcohol.quantity,
            Detail: JSON.stringify(body.personal_history.alcohol.detail),
            Comment: body.personal_history.alcohol.comment
          }
          let insertAlcohol = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
          let dataDrugabuse = {
            HN: body.HN,
            Habit: 'drugabuse',
            Status: body.personal_history.drugabuse.status,
            Quantity: body.personal_history.drugabuse.quantity,
            Detail: JSON.stringify(body.personal_history.drugabuse.detail),
            Comment: body.personal_history.drugabuse.comment
          }
          let insertDrugabuse = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
          let dataSmoke = {
            HN: body.HN,
            Habit: 'smoke',
            Status: body.personal_history.smoke.status,
            Quantity: body.personal_history.smoke.quantity,
            Detail: JSON.stringify(body.personal_history.smoke.detail),
            Comment: body.personal_history.smoke.comment
          }
          let insertSmoke = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertSmoke, dataSmoke)
        }
        
        res.send({message: 'Success'})
      }
    }
  }
  
  getPendingData() {
    return async (req: Request,res: Response) => {
      
      let repos = di.get("repos");
      try {
        let startNum = (parseInt("1") * 15) - 15
        let LimitNum = 15
        
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Screening.Patient_Info PI`
        query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` WHERE Approve != 1`
        query += ` AND Confirm = 1`
        // query += ` AND Site IN ('${site}')`
        query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          
        let queryCount = `SELECT COUNT(PI.ID) as count FROM Screening.Patient_Info PI`
        queryCount += ` WHERE Approve != 1`
        queryCount += ` AND Confirm = 1`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.HN, 'C36bJmRax7');
            return d.UID = encrypted.toString()
          })
          const result = {
            pagination:{
              currentPage: parseInt("1"),
              totalPage: Math.ceil(count[0].count/20),
              totalResult: count[0].count
            },
            result: data
          }
          res.send(result)
        
      } catch (error) {
        res.status(404).json([])
      }
    }
  }
  
  getApprovedData() {
    return async (req: Request,res: Response) => {
      
      let repos = di.get("repos");
      try {
        let startNum = (parseInt("1") * 15) - 15
        let LimitNum = 15
        
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Screening.Patient_Info PI`
        query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` WHERE Approve = 1`
        query += ` AND Confirm = 1`
        query += ` AND DownloadPDF != 1`
        // query += ` AND Site IN ('${site}')`
        query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          
        let queryCount = `SELECT COUNT(PI.ID) as count FROM Screening.Patient_Info PI`
        queryCount += ` WHERE Approve = 1`
        queryCount += ` AND Confirm = 1`
        queryCount += ` AND DownloadPDF != 1`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.HN, 'C36bJmRax7');
            return d.UID = encrypted.toString()
          })
          const result = {
            pagination:{
              currentPage: parseInt("1"),
              totalPage: Math.ceil(count[0].count/20),
              totalResult: count[0].count
            },
            result: data
          }
          res.send(result)
        
      } catch (error) {
        res.status(404).json([])
      }
    }
  }
  
  approveData() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get("repos");
      let getComment = (type: string, data: any) => {
        if (type == 'alcohol') {
          console.log(data.detail)
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
        } else if (type == 'exercise') {
          return `quantity: ${data.quantity}, comment: ${data.comment}`
        } else if (type == 'smoke') {
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
        }
      }
      if (body.type == 0) {
        let dateDob = new Date(body.patient_info.dob)
        let dataInfo = {
          Title: body.patient_info.title,
          Firstname: body.patient_info.firstname,
          Middlename: body.patient_info.middlename,
          Lastname: body.patient_info.lastname,
          DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
          Gender: body.patient_info.gender,
          Nationality: body.patient_info.nationality,
          Religion: body.patient_info.religion,
          PreferredLanguage: body.patient_info.preferredlanguage,
          Expatriate: body.patient_info.expatriate,
          MaritalStatus: body.patient_info.marital_status,
          NationalID: body.patient_info.national_id,
          Passport: body.patient_info.passport,
          Occupation: body.patient_info.occupation,
          PhoneNo: body.patient_info.phone_no,
          Email: body.patient_info.email,
          Homephone: body.patient_info.homephone,
          Officephone: body.patient_info.officephone
        }
        let queryInfo = `UPDATE Screening.Patient_Info SET ? WHERE HN = '${body.HN}'`
        await repos.query(queryInfo, dataInfo);
        let dataPermanent = {
          HN: body.HN,
          Country: body.permanent.country,
          Postcode: body.permanent.postcode,
          Subdistrict: body.permanent.subdistrict,
          District: body.permanent.districtid,
          Address: body.permanent.address,
          Province: body.permanent.provinceid,
          Type: 0,
          sameAddress: null
        }
        let queryPermanent = `REPLACE INTO Screening.Patient_Address SET ?`
        
        let dataPresent = {
          HN: body.HN,
          Country: body.present.sameAddress ? body.permanent.country : body.present.country,
          Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
          Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
          District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
          Address: body.present.sameAddress ? body.permanent.address : body.present.address,
          Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
          Type: 1,
          sameAddress: body.present.sameAddress
        }
        let queryPresent = `REPLACE INTO Screening.Patient_Address SET ?`
        let dataEmergency = {
          HN: body.HN,
          Firstname: body.emergency.first_name,
          Lastname: body.emergency.last_name,
          Relation: body.emergency.relation,
          Email: body.emergency.email,
          PhoneNo: body.emergency.phone_no,
          Country: body.emergency.sameAddress ? body.permanent.country : body.emergency.country,
          Postcode: body.emergency.sameAddress ? body.permanent.postcode : body.emergency.postcode,
          Subdistrict: body.emergency.sameAddress ? body.permanent.subdistrict : body.emergency.subdistrict,
          District: body.emergency.sameAddress ? body.permanent.districtid : body.emergency.districtid,
          Address: body.emergency.sameAddress ? body.permanent.address : body.emergency.address,
          Province: body.emergency.sameAddress ? body.permanent.provinceid : body.emergency.provinceid,
          sameAddress: body.emergency.sameAddress
        }
        let queryEmergency = `REPLACE INTO Screening.Patient_Emergency SET ?`

        let financialDob = new Date(body.financial.dob)
        let dataFinancial = {
          HN: body.HN,
          SelfPay: _.indexOf(body.financial.payment_method, 'Self pay') >= 0 ? 1 : 0,
          CompanyContact: _.indexOf(body.financial.payment_method, 'Company contract') >= 0 ? 1 : 0,
          Insurance: _.indexOf(body.financial.payment_method, 'Insurance') >= 0 ? 1 : 0,
          CompanyDesc: body.financial.company,
          InsuranceDesc: body.financial.insurance,
          PaymentAs: body.financial.payment_as,
          Title: body.financial.title,
          Firstname: body.financial.firstname,
          Lastname: body.financial.lastname,
          DOB: `${financialDob.getFullYear()}-${("0" + (financialDob.getMonth() + 1)).slice(-2)}-${("0" + financialDob.getDate()).slice(-2)}`,
          Aforemention: body.financial.aforemention,
        }
        let queryFinancial = `INSERT INTO Screening.Patient_Financial SET ?`

        let dataHistory = {
          HN: body.HN,
          MaritalStatus: body.personal_history.marital_status,
          Children: body.personal_history.children,
          Diseases: JSON.stringify(body.personal_history.diseases),
          Medication: body.personal_history.medication,
          CommentMedication: body.personal_history.c_medication,
          Hospitalization: body.personal_history.hospitalization,
          CommentHospitalization: body.personal_history.c_hospitalization,
          Physical: body.personal_history.physical,
          CommentPhysical: body.personal_history.c_physical,
          Exercise: body.personal_history.exercise.status,
          Pregnant: body.personal_history.pregnant,
          CommentPregnant: body.personal_history.c_pregnant,
          Giver: body.personal_history.giver,
          CommentGiver: body.personal_history.c_giver,
          AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
          Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
          GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
          StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
          Authorize: body.personal_history.authorize,
          CommentAuthorize: body.personal_history.c_authorize,
          Spiritual: body.personal_history.spiritual,
          CommentSpiritual: body.personal_history.c_spiritual,
          Allergies: body.personal_history.allergies,
          CommentAllergies: body.personal_history.c_allergies,
          Alcohol: body.personal_history.alcohol.status,
          DrugAbuse: body.personal_history.drugabuse.status,
          Smoke: body.personal_history.smoke.status,
          FatherAlive: body.personal_history.father.alive,
          FatherAge: body.personal_history.father.age,
          CauseFather: body.personal_history.father.cause,
          MotherAlive: body.personal_history.mother.alive,
          MotherAge: body.personal_history.mother.age,
          CauseMother: body.personal_history.mother.cause,
        }
        let queryHistory = `INSERT Screening.Patient_History SET ?`
        await repos.query(queryEmergency, dataEmergency)
        await repos.query(queryPermanent, dataPermanent)
        await repos.query(queryPresent, dataPresent)
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryHistory, dataHistory);
        if (body.personal_history.family.length > 0) {
          let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
          await repos.query(deleteFamily);
          let valuesFamily: any[] = [] 
          body.personal_history.family.map((p: any) => {
            if (p.person != null && p.illness != null) {
              let value = [body.HN, p.person, p.illness]
              valuesFamily.push(value) 
            }
          })
          let insertFamily = `INSERT INTO Screening.Family_History (HN, Person, Disease) VALUES ?;`
          if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
        }
        let deleteSocial = `DELETE FROM Screening.Patient_Social WHERE HN = '${body.HN}'`
        await repos.query(deleteSocial);
        if (body.personal_history.exercise.status != null) {
          let dataExercise = {
            HN: body.HN,
            Habit: 'exercise',
            Status: body.personal_history.exercise.status,
            Quantity: body.personal_history.exercise.quantity,
            Detail: null,
            Comment: body.personal_history.exercise.comment
          }
          let insertExercise = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
          let dataAlcohol = {
            HN: body.HN,
            Habit: 'alcohol',
            Status: body.personal_history.alcohol.status,
            Quantity: body.personal_history.alcohol.quantity,
            Detail: JSON.stringify(body.personal_history.alcohol.detail),
            Comment: body.personal_history.alcohol.comment
          }
          let insertAlcohol = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
          let dataDrugabuse = {
            HN: body.HN,
            Habit: 'drugabuse',
            Status: body.personal_history.drugabuse.status,
            Quantity: body.personal_history.drugabuse.quantity,
            Detail: JSON.stringify(body.personal_history.drugabuse.detail),
            Comment: body.personal_history.drugabuse.comment
          }
          let insertDrugabuse = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
          let dataSmoke = {
            HN: body.HN,
            Habit: 'smoke',
            Status: body.personal_history.smoke.status,
            Quantity: body.personal_history.smoke.quantity,
            Detail: JSON.stringify(body.personal_history.smoke.detail),
            Comment: body.personal_history.smoke.comment
          }
          let insertSmoke = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertSmoke, dataSmoke)
        }
        let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${body.patient_info.nationality}`
        let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${body.patient_info.religion}`
        let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.patient_info.gender}`
        let Nation = await repos.query(queryNation)
        let Religion = await repos.query(queryReligion)
        let Gender = await repos.query(queryGender)
        let Country = async (id: any) => {
          let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
          let country = await repos.query(queryCountry)
          if (!country.length) return null
          return country[0].Desc_TH
        }
        let Subdistrict = async (id: any) => {
          let querySubdistrict = `SELECT * FROM Registration.CT_CityArea WHERE ID = ${id}`
          let subdistrict = await repos.query(querySubdistrict)
          if (!subdistrict.length) return null
          return subdistrict[0].Desc_TH
        }
        let PreferredLanguage = async (id: any) => {
          let querySubdistrict = `SELECT Desc_EN FROM Registration.CT_PreferredLanguage WHERE ID = ${id}`
          let subdistrict = await repos.query(querySubdistrict)
          if (!subdistrict.length) return null
          return subdistrict[0].Desc_EN
        }
        let Title = async (id: any) => {
          let queryTitle = `SELECT * FROM Registration.CT_Title Where ID = ${id}`
          let title = await repos.query(queryTitle)
          if (!title.length) return null
          return title[0].Desc
        }
        let Relation = async (id: any) => {
          let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
          let relation = await repos.query(queryRelation)
          if (!relation.length) return null
          return relation[0].Code
        }
        let family = await Promise.all(body.personal_history.family.map(async (item: any): Promise<any> => {
          if (item.person != null && item.illness != null) {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
            let relation = await repos.query(queryRelation)
            return {
              "id_patient_family": null,
              "id_patient_information": null,
              "relation": relation[0].Desc,
              "disease": null,
              "start": 0,
              "end": 0,
              "comment": item.illness
            }
          }
        }));
        let social: any = new Array()
        let dataalcohol = await {
          id_patient_social: null,
          id_patient_information: null,
          habit: "Alcohol",
          quality: null,
          detail: null,
          comment: await getComment('alcohol', body.personal_history.alcohol)
        }
        let dataexercise = await {
          id_patient_social: null,
          id_patient_information: null,
          habit: "Exercise",
          quality : null,
          detail: null,
          comment: await getComment('exercise', body.personal_history.exercise)
        }
        let datasmoke = await {
          id_patient_social: null,
          id_patient_information: null,
          habit:"Smoking",
          quality: null,
          detail: null,
          comment: await getComment('smoke', body.personal_history.smoke)
        }
        if (body.personal_history.alcohol.status) await social.push(dataalcohol)
        if (body.personal_history.exercise.status) await social.push(dataexercise)
        if (body.personal_history.smoke.status) await social.push(datasmoke) 
        let checkstatus = (d: any) => {
          if (d == 'Single') return 1
          if (d == 'Married') return 2
          if (d == 'Divorced') return 3
          if (d == 'Widowed') return 4
          if (d == 'Priest') return 5
          if (d == 'Separated') return 6
          if (d == 'Unknown') return 7
        }
        
        let rpa = await {
          "data":{
            "server": rpaSetting.SERVER,
            "server_type": rpaSetting.SERVER_TYPE,
            "id_patient_information": 0,
            "patient_code":"",
            "hn": body.HN,
            "title_th": await Title(body.patient_info.title),
            "firstname_th": body.patient_info.firstname,
            "middlename_th": body.patient_info.middlename,
            "lastname_th": body.patient_info.lastname,
            "title_en":null,
            "firstname_en":null,
            "middlename_en":null,
            "lastname_en":null,
            "nationality": Nation.length ? Nation[0].Desc_EN : null,
            "religion": body.patient_info.religion,
            "religion_desc": Religion.length ? Religion[0].Desc_TH : null,
            "religion_desc_en": Religion.length ? Religion[0].Desc_EN : null,
            "national_id": body.patient_info.national_id,
            "passport_id": body.patient_info.passport,
            "dob": dateDob,
            "age":null,
            "gender": body.patient_info.gender,
            "gender_desc_en": Gender.length ? Gender[0].Desc_EN : null,
            "gender_desc_th": Gender.length ? Gender[0].Desc_TH : null,
            "marital_status": await checkstatus(body.patient_info.marital_status),
            "preferrend_language": await PreferredLanguage(body.patient_info.preferredlanguage),
            "occupation":body.patient_info.occupation,
            "mobile_phone":body.patient_info.phone_no,
            "email":body.patient_info.email,
            "home_telephone":body.patient_info.homephone,
            "office_telephone":body.patient_info.officephone,
            "permanent_address": body.permanent.address,
            "permanent_sub_district": await Subdistrict(body.permanent.subdistrict),
            "permanent_district": body.permanent.district,
            "permanent_province": body.permanent.province,
            "permanent_postcode": body.permanent.postcode,
            "permanent_country": await Country(body.permanent.country),
            "same_permanent": body.present.sameAddress ? 1 : 0,
            "present_address":body.present.sameAddress ? body.permanent.address : body.present.address,
            "present_sub_district":body.present.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(body.present.subdistrict),
            "present_district":body.present.sameAddress ? body.permanent.district : body.present.district,
            "present_province":body.present.sameAddress ? body.permanent.province : body.present.province,
            "present_postcode":body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
            "present_country":body.present.sameAddress ? await Country(body.permanent.country) : await Country(body.present.country),
            "ec_firstname":body.emergency.first_name,
            "ec_lastname":body.emergency.last_name,
            "ec_relationship": await Relation(body.emergency.relation),
            "ec_relationship_other": body.emergency.relation,
            "ec_telephone":body.emergency.phone_no,
            "ec_email":body.emergency.email,
            "ec_address_same_patient": body.emergency.sameAddress ? 1 : 0,
            "ec_address":body.emergency.sameAddress ? body.permanent.address : body.emergency.address,
            "ec_sub_district":body.emergency.sameAddress ? await Subdistrict(body.permanent.subdistrict) : body.emergency.subdistrict,
            "ec_district":body.emergency.sameAddress ? body.permanent.district : body.emergency.district,
            "ec_province":body.emergency.sameAddress ? body.permanent.province : body.emergency.province,
            "ec_postcode":body.emergency.sameAddress ? body.permanent.postcode : body.emergency.postcode,
            "ec_country":body.emergency.sameAddress ? await Country(body.permanent.country) : await Country(body.emergency.country),
            "fi_payment_method":body.financial.payment_method,
            "fi_company":body.financial.company,
            "date_created":null,
            "date_updated":null,
            "social_list": JSON.parse(JSON.stringify(social)),
            "family_list": JSON.parse(JSON.stringify(family)),
            "site": body.site,
            "location": null,
            "Truama":"No",
            "ARI":"No",
            "location_register": "1-Medical Record Department",
            "access_profile": "Registration Staff"
          }
        }
        let time = new Date();
        const filename = `RPA_Screening_Adult_${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}_${time.getTime()}.txt`
        const path = '/Process'
        await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa  })
        res.send({message: 'Success'})
      }
    }
  }
  updateScreening() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get("repos");
      let getComment = (type: string, data: any) => {
        if (type == 'alcohol') {
          console.log(data.detail)
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
        } else if (type == 'exercise') {
          return `quantity: ${data.quantity}, comment: ${data.comment}`
        } else if (type == 'smoke') {
          return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
        }
      }
      if (body.type == 0) {
        let dateDob = new Date(body.patient_info.dob)
        let dataHistory = {
          HN: body.HN,
          MaritalStatus: body.personal_history.marital_status,
          Children: body.personal_history.children,
          Diseases: JSON.stringify(body.personal_history.diseases),
          Medication: body.personal_history.medication,
          CommentMedication: body.personal_history.c_medication,
          Hospitalization: body.personal_history.hospitalization,
          CommentHospitalization: body.personal_history.c_hospitalization,
          Physical: body.personal_history.physical,
          CommentPhysical: body.personal_history.c_physical,
          Exercise: body.personal_history.exercise.status,
          Pregnant: body.personal_history.pregnant,
          CommentPregnant: body.personal_history.c_pregnant,
          Giver: body.personal_history.giver,
          CommentGiver: body.personal_history.c_giver,
          AbsenceFromWork: _.indexOf(body.personal_history.medical_certificate, 'absence') >= 0 ? 1 : 0,
          Reimbursement: _.indexOf(body.personal_history.medical_certificate, 'reimbursement') >= 0 ? 1 : 0,
          GovernmentReimbursement: _.indexOf(body.personal_history.doctor_certificate, 'government_reimbursement') >= 0 ? 1 : 0,
          StateEnterprise: _.indexOf(body.personal_history.doctor_certificate, 'state_enterprise') >= 0 ? 1 : 0,
          Authorize: body.personal_history.authorize,
          CommentAuthorize: body.personal_history.c_authorize,
          Spiritual: body.personal_history.spiritual,
          CommentSpiritual: body.personal_history.c_spiritual,
          Allergies: body.personal_history.allergies,
          CommentAllergies: body.personal_history.c_allergies,
          Alcohol: body.personal_history.alcohol.status,
          DrugAbuse: body.personal_history.drugabuse.status,
          Smoke: body.personal_history.smoke.status,
          FatherAlive: body.personal_history.father.alive,
          FatherAge: body.personal_history.father.age,
          CauseFather: body.personal_history.father.cause,
          MotherAlive: body.personal_history.mother.alive,
          MotherAge: body.personal_history.mother.age,
          CauseMother: body.personal_history.mother.cause,
        }
        let queryHistory = `INSERT Screening.Patient_History SET ?`
        await repos.query(queryHistory, dataHistory);
        if (body.personal_history.family.length > 0) {
          let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
          await repos.query(deleteFamily);
          let valuesFamily: any[] = [] 
          body.personal_history.family.map((p: any) => {
            if (p.person != null && p.illness != null) {
              let value = [body.HN, p.person, p.illness]
              valuesFamily.push(value) 
            }
          })
          let insertFamily = `INSERT INTO Screening.Family_History (HN, Person, Disease) VALUES ?;`
          if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
        }
        let deleteSocial = `DELETE FROM Screening.Patient_Social WHERE HN = '${body.HN}'`
        await repos.query(deleteSocial);
        if (body.personal_history.exercise.status != null) {
          let dataExercise = {
            HN: body.HN,
            Habit: 'exercise',
            Status: body.personal_history.exercise.status,
            Quantity: body.personal_history.exercise.quantity,
            Detail: null,
            Comment: body.personal_history.exercise.comment
          }
          let insertExercise = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
          let dataAlcohol = {
            HN: body.HN,
            Habit: 'alcohol',
            Status: body.personal_history.alcohol.status,
            Quantity: body.personal_history.alcohol.quantity,
            Detail: JSON.stringify(body.personal_history.alcohol.detail),
            Comment: body.personal_history.alcohol.comment
          }
          let insertAlcohol = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
          let dataDrugabuse = {
            HN: body.HN,
            Habit: 'drugabuse',
            Status: body.personal_history.drugabuse.status,
            Quantity: body.personal_history.drugabuse.quantity,
            Detail: JSON.stringify(body.personal_history.drugabuse.detail),
            Comment: body.personal_history.drugabuse.comment
          }
          let insertDrugabuse = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
          let dataSmoke = {
            HN: body.HN,
            Habit: 'smoke',
            Status: body.personal_history.smoke.status,
            Quantity: body.personal_history.smoke.quantity,
            Detail: JSON.stringify(body.personal_history.smoke.detail),
            Comment: body.personal_history.smoke.comment
          }
          let insertSmoke = `INSERT INTO Screening.Patient_Social SET ?`
          await repos.query(insertSmoke, dataSmoke)
        }
        let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${body.patient_info.nationality}`
        let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${body.patient_info.religion}`
        let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.patient_info.gender}`
        let Nation = await repos.query(queryNation)
        let Religion = await repos.query(queryReligion)
        let Gender = await repos.query(queryGender)
        let Country = async (id: any) => {
          let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
          let country = await repos.query(queryCountry)
          if (!country.length) return null
          return country[0].Desc_TH
        }
        let Subdistrict = async (id: any) => {
          let querySubdistrict = `SELECT * FROM Registration.CT_CityArea WHERE ID = ${id}`
          let subdistrict = await repos.query(querySubdistrict)
          if (!subdistrict.length) return null
          return subdistrict[0].Desc_TH
        }
        let PreferredLanguage = async (id: any) => {
          let querySubdistrict = `SELECT Desc_EN FROM Registration.CT_PreferredLanguage WHERE ID = ${id}`
          let subdistrict = await repos.query(querySubdistrict)
          if (!subdistrict.length) return null
          return subdistrict[0].Desc_EN
        }
        let Title = async (id: any) => {
          let queryTitle = `SELECT * FROM Registration.CT_Title Where ID = ${id}`
          let title = await repos.query(queryTitle)
          if (!title.length) return null
          return title[0].Desc
        }
        let Relation = async (id: any) => {
          let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
          let relation = await repos.query(queryRelation)
          if (!relation.length) return null
          return relation[0].Code
        }
        let family = await Promise.all(body.personal_history.family.map(async (item: any): Promise<any> => {
          if (item.person != null && item.illness != null) {
            let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
            let relation = await repos.query(queryRelation)
            return {
              "id_patient_family": null,
              "id_patient_information": null,
              "relation": relation[0].Desc,
              "disease": null,
              "start": 0,
              "end": 0,
              "comment": item.illness
            }
          }
        }));
        let social: any = new Array()
        let dataalcohol = await {
          id_patient_social: null,
          id_patient_information: null,
          habit: "Alcohol",
          quality: null,
          detail: null,
          comment: await getComment('alcohol', body.personal_history.alcohol)
        }
        let dataexercise = await {
          id_patient_social: null,
          id_patient_information: null,
          habit: "Exercise",
          quality : null,
          detail: null,
          comment: await getComment('exercise', body.personal_history.exercise)
        }
        let datasmoke = await {
          id_patient_social: null,
          id_patient_information: null,
          habit:"Smoking",
          quality: null,
          detail: null,
          comment: await getComment('smoke', body.personal_history.smoke)
        }
        if (body.personal_history.alcohol.status) await social.push(dataalcohol)
        if (body.personal_history.exercise.status) await social.push(dataexercise)
        if (body.personal_history.smoke.status) await social.push(datasmoke) 
        let checkstatus = (d: any) => {
          if (d == 'Single') return 1
          if (d == 'Married') return 2
          if (d == 'Divorced') return 3
          if (d == 'Widowed') return 4
          if (d == 'Priest') return 5
          if (d == 'Separated') return 6
          if (d == 'Unknown') return 7
        }
                
        let rpa = await {
          "data":{
            "server": rpaSetting.SERVER,
            "server_type": rpaSetting.SERVER_TYPE,
            "id_patient_information": 0,
            "patient_code":"",
            "hn": body.HN,
            "title_th": await Title(body.patient_info.title),
            "firstname_th": body.patient_info.firstname,
            "middlename_th": body.patient_info.middlename,
            "lastname_th": body.patient_info.lastname,
            "title_en":null,
            "firstname_en":null,
            "middlename_en":null,
            "lastname_en":null,
            "nationality": Nation.length ? Nation[0].Desc_EN : null,
            "religion": body.patient_info.religion,
            "religion_desc": Religion.length ? Religion[0].Desc_TH : null,
            "religion_desc_en": Religion.length ? Religion[0].Desc_EN : null,
            "national_id": body.patient_info.national_id,
            "passport_id": body.patient_info.passport,
            "dob": dateDob,
            "age":null,
            "gender": body.patient_info.gender,
            "gender_desc_en": Gender.length ? Gender[0].Desc_EN : null,
            "gender_desc_th": Gender.length ? Gender[0].Desc_TH : null,
            "marital_status": await checkstatus(body.patient_info.marital_status),
            "preferrend_language": await PreferredLanguage(body.patient_info.preferredlanguage),
            "occupation":body.patient_info.occupation,
            "mobile_phone":body.patient_info.phone_no,
            "email":body.patient_info.email,
            "home_telephone":body.patient_info.homephone,
            "office_telephone":body.patient_info.officephone,
            "permanent_address": body.permanent.address,
            "permanent_sub_district": await Subdistrict(body.permanent.subdistrict),
            "permanent_district": body.permanent.district,
            "permanent_province": body.permanent.province,
            "permanent_postcode": body.permanent.postcode,
            "permanent_country": await Country(body.permanent.country),
            "same_permanent": 0,
            "present_address": null,
            "present_sub_district": null,
            "present_district": null,
            "present_province": null,
            "present_postcode": null,
            "present_country": null,
            "ec_firstname":body.emergency.first_name,
            "ec_lastname":body.emergency.last_name,
            "ec_relationship": await Relation(body.emergency.relation),
            "ec_relationship_other": body.emergency.relation,
            "ec_telephone":body.emergency.phone_no,
            "ec_email":body.emergency.email,
            "ec_address_same_patient": 0,
            "ec_address": null,
            "ec_sub_district": null,
            "ec_district": null,
            "ec_province": null,
            "ec_postcode": null,
            "ec_country": null,
            "fi_payment_method": null,
            "fi_company": null,
            "date_created":null,
            "date_updated":null,
            "social_list": JSON.parse(JSON.stringify(social)),
            "family_list": JSON.parse(JSON.stringify(family)),
            "site": body.site,
            "location":  null,
            "Truama":"No",
            "ARI":"No",
            "location_register": "1-Medical Record Department",
            "access_profile": "Registration Staff"
          }
        }
        let time = new Date();
        const filename = `RPA_Screening_Adult_${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}_${time.getTime()}.txt`
        const path = '/Process'
        await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa  })
        res.send({message: 'Success'})
      } else if (body.type == 1) {
        
      }
    }
  }
}

const router = Router();
const route = new screeningRoute();

router.post("/search", route.getSearch())
      .post("/signature", route.saveSignature())
      .post("/update", route.updateData())
      .post("/getPendingData", route.getPendingData())
      .post("/approve", route.approveData())
      .post("/screening", route.updateScreening())
      .post("/signatureApprove", route.saveSignatureApprove())
      .post("/getApprovedData", route.getApprovedData())
      

export const screening = router;