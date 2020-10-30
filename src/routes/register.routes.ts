import { Request, Response, Router } from "express";
import { di } from "../di";
import * as _ from "lodash";
import CryptoJS from "crypto-js";
const axios = require('axios');
import { rpaSetting } from "../config/config";
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Bangkok');

class registerRoute {
  async handleConsent(data: any, id: any) {
    let repos = di.get("repos")
    let query_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '1', '${data.consent_1.text}', ${data.consent_1.status})`
    let query_2_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_1', '${data.consent_2_1.text}', ${data.consent_2_1.status})`
    let query_2_2 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_2', '${data.consent_2_2.text}', ${data.consent_2_2.status})`
    let query_2_3 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_3', '${data.consent_2_3.text}', ${data.consent_2_3.status})`
    let query_2_4 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_4', '${data.consent_2_4.text}', ${data.consent_2_4.status})`
    let query_2_5_1 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_1', '${data.consent_2_5_1.text}', ${data.consent_2_5_1.status})`
    let query_2_5_2 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_2', '${data.consent_2_5_2.text}', ${data.consent_2_5_2.status})`
    let query_2_5_3 = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, '2_5_3', '${data.consent_2_5_3.text}', ${data.consent_2_5_3.status})`
    await repos.query(query_1)
    await repos.query(query_2_1)
    await repos.query(query_2_2)
    await repos.query(query_2_3)
    await repos.query(query_2_4)
    await repos.query(query_2_5_1)
    await repos.query(query_2_5_2)
    await repos.query(query_2_5_3)
    if (data.other.choice_1.status === true) {
      let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_1', '${data.other.choice_1.text}', ${data.other.choice_1.status})`
      repos.query(query)
    }
    if (data.other.choice_2.status === true) {
      let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_2', '${data.other.choice_2.text}', ${data.other.choice_2.status})`
      repos.query(query)
    }
    if (data.other.choice_3.status === true) {
      let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_3', '${data.other.choice_3.text}', ${data.other.choice_3.status})`
      repos.query(query)
    }
    if (data.other.choice_4.status === true) {
      let query = `REPLACE INTO Registration.Consent (PatientID, Clause, Message, Agree) VALUES(${id}, 'other_4', '${data.other.choice_4.text}', ${data.other.choice_4.status})`
      repos.query(query)
    }
    return
  }
  Capitalize = (s: any) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  sendRPA() {
    return
  }
  async getPatientByIdFromDB(uid: string) {
    let repos = di.get("repos");
    let query = `SELECT PI.* FROM Registration.Patient_Info PI`
    query += ` WHERE 1 = 1`
    query += ` AND PI.UID = '${uid}'`
    let info = await repos.query(query)
    if (info[0].Type == 0) {
      let queryAddress = `SELECT * FROM Registration.Patient_Address WHERE PatientID = ${info[0].ID} ORDER BY Type`
      let queryEmergency = `SELECT * FROM Registration.Patient_Emergency WHERE PatientID = ${info[0].ID}`
      let queryFinancial = `SELECT * FROM Registration.Patient_Financial WHERE PatientID = ${info[0].ID}`
      let queryHistory = `SELECT * FROM Registration.Patient_History WHERE PatientID = ${info[0].ID}`
      let queryFamily = `SELECT * FROM Registration.Family_History WHERE PatientID = ${info[0].ID}`
      let querySocial = `SELECT * FROM Registration.Patient_Social WHERE PatientID = ${info[0].ID}`
      let queryConsent = `SELECT * FROM Registration.Consent WHERE PatientID = ${info[0].ID}`
      let address = await repos.query(queryAddress)
      let emergency = await repos.query(queryEmergency)
      let financial = await repos.query(queryFinancial)
      let history = await repos.query(queryHistory)
      let family = await repos.query(queryFamily)
      let social = await repos.query(querySocial)
      let consent = await repos.query(queryConsent)
      let dataSocial = social.map((d: any) => {
        let data = {
          Habit: d.Habit,
          Status: d.Status,
          Quantity: d.Quantity,
          Detail: JSON.parse(d.Detail),
          Comment: d.Comment
        }
        return data
      })
      let payment = []
      let familylist: any = []
      if (financial.length) {
        if (financial[0].SelfPay == 1) payment.push('Self pay')
        if (financial[0].CompanyContact == 1) payment.push('Company contract')
        if (financial[0].Insurance == 1) payment.push('Insurance')
      }
      family.map((d:any) => {
        let data = {
          illness: d.Disease,
          person: d.Person
        }
        familylist.push(data)
      })
      let result = {
        Info: info[0],
        Permanent: address[0],
        Present: address[1],
        Emergency: {
          Firstname: emergency[0].Firstname,
          Lastname: emergency[0].Lastname,
          Relation: emergency[0].Relation,
          sameAddress: emergency[0].sameAddress,
          Country: emergency[0].Country,
          Province: emergency[0].Province,
          Postcode: emergency[0].Postcode,
          Subdistrict: emergency[0].Subdistrict,
          District: emergency[0].District,
          Address: emergency[0].Address,
          PhoneNo: emergency[0].PhoneNo,
          Email: emergency[0].Email,
        },
        Financial: {
          payment_method: payment,
          showInsurance: financial[0].Insurance == 1 ? true : false,
          showCompany: financial[0].CompanyContact == 1 ? true : false,
          InsuranceDesc: financial[0].InsuranceDesc,
          CompanyDesc: financial[0].CompanyDesc,
          PaymentAs: financial[0].PaymentAs,
          Title: financial[0].Title,
          Firstname: financial[0].Firstname,
          Lastname: financial[0].Lastname,
          DOB: financial[0].DOB,
          Aforemention: financial[0].Aforemention,
        },
        History: {
          MaritalStatus: history[0].MaritalStatus,
          Children: history[0].Children,
          Diseases: JSON.parse(history[0].Diseases),
          Medication: history[0].Medication == null ? history[0].Medication : history[0].Medication == 1 ? true : false,
          CommentMedication: history[0].CommentMedication,
          Hospitalization: history[0].Hospitalization == null ? history[0].Hospitalization : history[0].Hospitalization == 1 ? true : false,
          CommentHospitalization: history[0].CommentHospitalization,
          Physical: history[0].Physical == null ? history[0].Physical : history[0].Physical == 1 ? true : false,
          CommentPhysical: history[0].CommentPhysical,
          Exercise: history[0].Exercise == null ? history[0].Exercise : history[0].Exercise == 1 ? true : false,
          Pregnant: history[0].Pregnant == null ? history[0].Pregnant : history[0].Pregnant == 1 ? true : false,
          CommentPregnant: history[0].CommentPregnant,
          Giver: history[0].Giver == null ? history[0].Giver : history[0].Giver == 1 ? true : false,
          CommentGiver: history[0].CommentGiver,
          AbsenceFromWork: history[0].AbsenceFromWork == 1 ? true : false,
          Reimbursement: history[0].Reimbursement == 1 ? true : false,
          GovernmentReimbursement: history[0].GovernmentReimbursement == 1 ? true : false,
          StateEnterprise: history[0].StateEnterprise == 1 ? true : false,
          Authorize: history[0].Authorize == null ? history[0].Authorize : history[0].Authorize == 1 ? true : false,
          CommentAuthorize: history[0].CommentAuthorize,
          Spiritual: history[0].Spiritual == null ? history[0].Spiritual : history[0].Spiritual == 1 ? true : false,
          CommentSpiritual: history[0].CommentSpiritual,
          Allergies: history[0].Allergies == null ? history[0].Allergies : history[0].Allergies == 1 ? true : false,
          CommentAllergies: history[0].CommentAllergies,
          Alcohol: history[0].Alcohol == null ? history[0].Alcohol : history[0].Alcohol == 1 ? true : false,
          DrugAbuse: history[0].DrugAbuse == null ? history[0].DrugAbuse : history[0].DrugAbuse == 1 ? true : false,
          Smoke: history[0].Smoke == null ? history[0].Smoke : history[0].Smoke == 1 ? true : false,
          FatherAlive: history[0].FatherAlive == null ? history[0].FatherAlive : history[0].FatherAlive == 1 ? true : false,
          FatherAge: history[0].FatherAge,
          CauseFather: history[0].CauseFather,
          MotherAlive: history[0].MotherAlive == null ? history[0].MotherAlive : history[0].MotherAlive == 1 ? true : false,
          MotherAge: history[0].MotherAge,
          CauseMother: history[0].CauseMother,
        },
        Family: familylist,
        SocialHistory: dataSocial,
        Consent: consent
      }
      return result
    } else {
      let queryAddress = `SELECT * FROM Registration.Patient_Address WHERE PatientID = ${info[0].ID} ORDER BY Type`
      let queryParent = `SELECT p.* FROM Registration.Parent p WHERE p.PatientID = ${info[0].ID}`
      let queryFinancial = `SELECT * FROM Registration.Patient_Financial WHERE PatientID = ${info[0].ID}`
      let queryFamily = `SELECT * FROM Registration.Family_History WHERE PatientID = ${info[0].ID}`
      let queryPediatric = `SELECT * FROM Registration.Pediatric WHERE PatientID = ${info[0].ID}`
      let queryConsent = `SELECT * FROM Registration.Consent WHERE PatientID = ${info[0].ID}`
      let address = await repos.query(queryAddress)
      let parent = await repos.query(queryParent)
      let financial = await repos.query(queryFinancial)
      let family = await repos.query(queryFamily)
      let pediatric = await repos.query(queryPediatric)
      let consent = await repos.query(queryConsent)
      let payment = []
      let familylist: any = []
      let filterpermanent = await address.filter((d:any) => d.Type == 0)
      let filterpersent = await address.filter((d:any) => d.Type == 1)
      if (financial.length) {
        if (financial[0].SelfPay == 1) payment.push('Self pay')
        if (financial[0].CompanyContact == 1) payment.push('Company contract')
        if (financial[0].Insurance == 1) payment.push('Insurance')
      }
      await family.map((d:any) => {
        let data = {
          illness: d.Disease,
          person: d.Person
        }
        familylist.push(data)
      })
      let result = {
        Info: info[0],
        Permanent: filterpermanent[0],
        Present: filterpersent[0],
        Parent: parent,
        Financial: {
          payment_method: payment,
          showInsurance: financial[0].Insurance == 1 ? true : false,
          showCompany: financial[0].CompanyContact == 1 ? true : false,
          InsuranceDesc: financial[0].InsuranceDesc,
          CompanyDesc: financial[0].CompanyDesc,
        },
        Pediatric: pediatric[0],
        Family: familylist,
        Consent: consent
      }
      return result
    } 
  }
  postRegister() {
    return async (req: Request, res: Response) => {
      let body = req.body;
      let repos = di.get("repos");
      if ( body.type == 0 ) {
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
          Officephone: body.patient_info.officephone,
          Confirm: 0,
          Type: body.type,
          Site: body.site
        }
        let queryInfo = `INSERT INTO Registration.Patient_Info SET ?`
        let insertInfo = await repos.query(queryInfo, dataInfo);
        // -- //
        let dataAddress: any = new Array()
        let permanentAddress = [
          insertInfo.insertId,
          body.permanent.country,
          body.permanent.postcode,
          body.permanent.subdistrict,
          body.permanent.districtid,
          body.permanent.address,
          body.permanent.provinceid,
          null,
          0
        ]
        let presentAddress = [
          insertInfo.insertId,
          body.present.sameAddress ? body.permanent.country : body.present.country,
          body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
          body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
          body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
          body.present.sameAddress ? body.permanent.address : body.present.address,
          body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
          body.present.sameAddress,
          1
        ]
        
        dataAddress.push(permanentAddress)
        dataAddress.push(presentAddress)

        let dataEmergency = {
          PatientID: insertInfo.insertId,
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
        let financialDob = new Date(body.financial.dob)
        let dataFinancial = {
          PatientID: insertInfo.insertId,
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
        let dataHistory = {
          PatientID: insertInfo.insertId,
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
        // --- //
        let queryAddress = `INSERT INTO Registration.Patient_Address (PatientID, Country, Postcode, Subdistrict, District, Address, Province, sameAddress, Type) VALUES ?`
        let queryEmegency = `INSERT INTO Registration.Patient_Emergency SET ?`
        let queryFinancial = `INSERT INTO Registration.Patient_Financial SET ?`
        let queryHistory = `INSERT INTO Registration.Patient_History SET ?`
        // -- //
        await repos.query(queryAddress, [dataAddress]);
        await repos.query(queryEmegency, dataEmergency);
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryHistory, dataHistory);
        if (body.personal_history.family.length > 0) {
          let valuesFamily: any[] = [] 
          body.personal_history.family.map((p: any) => {
            if (p.person != null && p.illness != null) {
              let value = [insertInfo.insertId, p.person, p.illness]
              valuesFamily.push(value) 
            }
          })
          let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
          if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
        }
        if (body.personal_history.exercise.status != null) {
          let dataExercise = {
            PatientID: insertInfo.insertId,
            Habit: 'exercise',
            Status: body.personal_history.exercise.status,
            Quantity: body.personal_history.exercise.quantity,
            Detail: null,
            Comment: body.personal_history.exercise.comment
          }
          let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
          await repos.query(insertExercise, dataExercise)
        }
        if (body.personal_history.alcohol.status != null) {
          let dataAlcohol = {
            PatientID: insertInfo.insertId,
            Habit: 'alcohol',
            Status: body.personal_history.alcohol.status,
            Quantity: body.personal_history.alcohol.quantity,
            Detail: JSON.stringify(body.personal_history.alcohol.detail),
            Comment: body.personal_history.alcohol.comment
          }
          let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
          await repos.query(insertAlcohol, dataAlcohol)
        }
        if (body.personal_history.drugabuse.status != null) {
          let dataDrugabuse = {
            PatientID: insertInfo.insertId,
            Habit: 'drugabuse',
            Status: body.personal_history.drugabuse.status,
            Quantity: body.personal_history.drugabuse.quantity,
            Detail: JSON.stringify(body.personal_history.drugabuse.detail),
            Comment: body.personal_history.drugabuse.comment
          }
          let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
          await repos.query(insertDrugabuse, dataDrugabuse)
        }
        if (body.personal_history.smoke.status != null) {
          let dataSmoke = {
            PatientID: insertInfo.insertId,
            Habit: 'smoke',
            Status: body.personal_history.smoke.status,
            Quantity: body.personal_history.smoke.quantity,
            Detail: JSON.stringify(body.personal_history.smoke.detail),
            Comment: body.personal_history.smoke.comment
          }
          let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
          await repos.query(insertSmoke, dataSmoke)
        }
        this.handleConsent(body.consent_form, insertInfo.insertId)
        res.send({message: 'Success'})
      } else if ( body.type == 1 ) {
        let dateDob = new Date(body.general_info.dob)
        let dataInfo = {
          Title: body.general_info.title,
          Firstname: body.general_info.firstname,
          Middlename: body.general_info.middlename,
          Lastname: body.general_info.lastname,
          DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
          Gender: body.general_info.gender,
          Nationality: body.general_info.nationality,
          PhoneNo: body.general_info.phone_no,
          Email: body.general_info.email,
          Confirm: 0,
          Type: body.type,
          Site: body.site
        }
        let queryInfo = `INSERT INTO Registration.Patient_Info SET ?`
        let insertInfo = await repos.query(queryInfo, dataInfo);
        let dataAddress: any = new Array()
        let permanentAddress = [
          insertInfo.insertId,
          body.permanent.country,
          body.permanent.postcode,
          body.permanent.subdistrict,
          body.permanent.districtidid,
          body.permanent.address,
          body.permanent.provinceidid,
          null,
          0
        ]
        let presentAddress = [
          insertInfo.insertId,
          body.present.sameAddress ? body.permanent.country : body.present.country,
          body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
          body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
          body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
          body.present.sameAddress ? body.permanent.address : body.present.address,
          body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
          body.present.sameAddress,
          1
        ]
        dataAddress.push(permanentAddress)
        dataAddress.push(presentAddress)
        let dataFinancial = {
          PatientID: insertInfo.insertId,
          SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
          CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
          Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
          CompanyDesc: body.parent_info.company,
          InsuranceDesc: body.parent_info.insurance,
        }
        let dataPediatric = {
          PatientID: insertInfo.insertId,
          Pob: body.pediatric.pob,
          BloodGroup: body.pediatric.blood_group,
          Weight: body.pediatric.weight,
          Height: body.pediatric.length,
          head: body.pediatric.head,
          Delivery: body.pediatric.delivery,
          DeliveryScore1: body.pediatric.deliveryscore1,
          DeliveryScore2: body.pediatric.deliveryscore2,
          Tsh: body.pediatric.tsh,
          Pku: body.pediatric.pku,
          Hearing: body.pediatric.hearing,
          Problems: body.pediatric.problems,
          ProblemsComment: body.pediatric.c_problems,
          Delay: body.pediatric.delay,
          DelayComment: body.pediatric.c_delay,
          Drug: body.pediatric.drug,
          DrugComment: body.pediatric.c_drug,
          Food: body.pediatric.food,
          FoodComment: body.pediatric.c_food,
          Other: body.pediatric.other,
          Othercomment: body.pediatric.c_other,
          Illness: body.pediatric.illness,
          Curmed: body.pediatric.curmed,
          Hospitalization: body.pediatric.hospitalization,
          HospitalizationComment: body.pediatric.c_hospitalization,
          Siblings: body.siblings.siblings
        }
        let queryAddress = `INSERT INTO Registration.Patient_Address (PatientID, Country, Postcode, Subdistrict, District, Address, Province, sameAddress, Type) VALUES ?`
        let queryFinancial = `INSERT INTO Registration.Patient_Financial SET ?`
        let queryPediatric = `INSERT INTO Registration.Pediatric SET ?`
        await repos.query(queryAddress, [dataAddress]);
        await repos.query(queryFinancial, dataFinancial);
        await repos.query(queryPediatric, dataPediatric);
        let valuesParent:  any[] = [] 
        await body.parent_info.parent.map((d: any) => {
          let parentdata = [
            insertInfo.insertId,
            d.title,
            d.firstname,
            d.middlename,
            d.lastname,
            d.relation,
            d.phoneno,
            d.email,
            d.contactemergency,
            d.livewithperson,
            d.sameAddress ? body.permanent.country : d.country,
            d.sameAddress ? body.permanent.postcode : d.postcode,
            d.sameAddress ? body.permanent.subdistrict : d.subdistrict,
            d.sameAddress ? body.permanent.districtid : d.districtid,
            d.sameAddress ? body.permanent.address : d.address,
            d.sameAddress ? body.permanent.provinceid : d.provinceid,
            d.sameAddress
          ]
          valuesParent.push(parentdata) 
        })
        
        let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
        await repos.query(queryParent, [valuesParent]);
        if (body.siblings.family.length > 0) {
          let valuesFamily: any[] = [] 
          body.siblings.family.map((p: any) => {
            if (p.person != null && p.illness != null) {
              let value = [insertInfo.insertId, p.person, p.illness]
              valuesFamily.push(value) 
            }
          })
          let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
          if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
        }
        this.handleConsent(body.consent_form, insertInfo.insertId)
        res.send({message: 'Success'})
      }
    };
  }
  getPendingData() {
    return async (req: Request,res: Response) => {
      
      let repos = di.get("repos");
      try {
        let startNum = (parseInt("1") * 15) - 15
        let LimitNum = 15
        
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
        query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` WHERE Approve != 1`
        query += ` AND Confirm = 1`
        // query += ` AND Site IN ('${site}')`
        query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          
        let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
        queryCount += ` WHERE Approve != 1`
        queryCount += ` AND Confirm = 1`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
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
        
        let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
        query += ` LEFT JOIN Registration.CT_Sex CTS ON CTS.Id = PI.Gender`
        query += ` WHERE Approve = 1`
        query += ` AND Confirm = 1`
        query += ` AND DownloadPDF != 1`
        // query += ` AND Site IN ('${site}')`
        query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          
        let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
        queryCount += ` WHERE Approve = 1`
        queryCount += ` AND Confirm = 1`
        queryCount += ` AND DownloadPDF != 1`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
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
  getSearch() {
    return async (req: Request, res: Response) => {
      let {id, firstname, lastname, phone_no, passport, dateOfBirth, national_id, site, page} = req.body;
      
      let repos = di.get("repos");
      try {
        let startNum = (parseInt(page) * 15) - 15
        let LimitNum = 15
        if (_.isEmpty(id) && !_.isNumber(id)) {
          let query = `SELECT PI.*, CTS.Desc_EN Gender_Desc FROM Registration.Patient_Info PI`
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
          query += ` AND Site IN ('${site}')`
          query += ` ORDER BY ID ASC LIMIT ${startNum},${LimitNum}`
          let queryCount = `SELECT COUNT(PI.ID) as count FROM Registration.Patient_Info PI`
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
          queryCount += ` AND Site IN ('${site}')`

          let count = await repos.query(queryCount)
          let data = await repos.query(query)
          await data.map((d: any) => {
            let encrypted = CryptoJS.AES.encrypt(d.UID, 'C36bJmRax7');
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
          res.send(result)
        } else {
          let decrypted = await CryptoJS.AES.decrypt(id, "C36bJmRax7")
          let uid = decrypted.toString(CryptoJS.enc.Utf8)
          let data = await this.getPatientByIdFromDB(uid)
          res.send(data)
          
        }
      } catch (error) {
        res.status(404).json([])
      }
    }
  }
  saveSignature() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, id, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Registration.Patient_Info SET Confirm=1 WHERE ID=${id};`
      let insertSignature = `INSERT INTO Registration.Signature (PatientID, HashSiganture, Signature, SignType) VALUES(${id}, '${signatureHash}', '${signatureImage}', '${signType}');`
      await repos.query(query)
      await repos.query(insertSignature)
      res.send({message: 'Success'})
    }
  }
  async updateAdult(body: any) {
    let repos = di.get("repos");
    let getComment = (type: string, data: any) => {
      if (type == 'alcohol') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
      } else if (type == 'exercise') {
        return `quantity: ${data.quantity}, comment: ${data.comment}`
      } else if (type == 'smoke') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
      }
    }
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
    let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${body.ID}'`
    
    let dataPermanent = {
      Country: body.permanent.country,
      Postcode: body.permanent.postcode,
      Subdistrict: body.permanent.subdistrict,
      District: body.permanent.districtid,
      Address: body.permanent.address,
      Province: body.permanent.provinceid,
      sameAddress: null
    }
    let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 0`
    
    let dataPresent = {
      Country: body.present.sameAddress ? body.permanent.country : body.present.country,
      Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
      Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
      District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
      Address: body.present.sameAddress ? body.permanent.address : body.present.address,
      Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
      sameAddress: body.present.sameAddress
    }
    let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 1`

    let dataEmergency = {
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
    let queryEmergency = `UPDATE Registration.Patient_Emergency SET ? WHERE PatientID = '${body.ID}'`

    let financialDob = new Date(body.financial.dob)
    let dataFinancial = {
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
    let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${body.ID}'`
    let dataHistory = {
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
    let queryHistory = `UPDATE Registration.Patient_History SET ? Where PatientID = '${body.ID}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryEmergency, dataEmergency)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryHistory, dataHistory);

    if (body.personal_history.family.length > 0) {
      let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${body.ID}'`
      await repos.query(deleteFamily);
      let valuesFamily: any[] = [] 
      body.personal_history.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.ID, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    let deleteSocial = `DELETE FROM Registration.Patient_Social WHERE PatientID = '${body.ID}'`
    await repos.query(deleteSocial);
    if (body.personal_history.exercise.status != null) {
      let dataExercise = {
        PatientID: body.ID,
        Habit: 'exercise',
        Status: body.personal_history.exercise.status,
        Quantity: body.personal_history.exercise.quantity,
        Detail: null,
        Comment: body.personal_history.exercise.comment
      }
      let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertExercise, dataExercise)
    }
    if (body.personal_history.alcohol.status != null) {
      let dataAlcohol = {
        PatientID: body.ID,
        Habit: 'alcohol',
        Status: body.personal_history.alcohol.status,
        Quantity: body.personal_history.alcohol.quantity,
        Detail: JSON.stringify(body.personal_history.alcohol.detail),
        Comment: body.personal_history.alcohol.comment
      }
      let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertAlcohol, dataAlcohol)
    }
    if (body.personal_history.drugabuse.status != null) {
      let dataDrugabuse = {
        PatientID: body.ID,
        Habit: 'drugabuse',
        Status: body.personal_history.drugabuse.status,
        Quantity: body.personal_history.drugabuse.quantity,
        Detail: JSON.stringify(body.personal_history.drugabuse.detail),
        Comment: body.personal_history.drugabuse.comment
      }
      let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertDrugabuse, dataDrugabuse)
    }
    if (body.personal_history.smoke.status != null) {
      let dataSmoke = {
        PatientID: body.ID,
        Habit: 'smoke',
        Status: body.personal_history.smoke.status,
        Quantity: body.personal_history.smoke.quantity,
        Detail: JSON.stringify(body.personal_history.smoke.detail),
        Comment: body.personal_history.smoke.comment
      }
      let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertSmoke, dataSmoke)
    }
    this.handleConsent(body.consent_form, body.ID)
    
    return
    
  }
  async updateChild(body: any) {
    let repos = di.get("repos");
    let dateDob = new Date(body.general_info.dob)
    let dataInfo = {
      Title: body.general_info.title,
      Firstname: body.general_info.firstname,
      Middlename: body.general_info.middlename,
      Lastname: body.general_info.lastname,
      DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
      Gender: body.general_info.gender,
      Nationality: body.general_info.nationality,
      PhoneNo: body.general_info.phone_no,
      Email: body.general_info.email,
      Type: body.type,
      Site: body.site
    }
    let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${body.ID}'`
    let dataPermanent = {
      Country: body.permanent.country,
      Postcode: body.permanent.postcode,
      Subdistrict: body.permanent.subdistrict,
      District: body.permanent.districtid,
      Address: body.permanent.address,
      Province: body.permanent.provinceid,
      sameAddress: null
    }
    let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 0`
    let dataPresent = {
      Country: body.present.sameAddress ? body.permanent.country : body.present.country,
      Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
      Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
      District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
      Address: body.present.sameAddress ? body.permanent.address : body.present.address,
      Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
      sameAddress: body.present.sameAddress
    }
    let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 1`
    let dataFinancial = {
      SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
      CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
      Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
      CompanyDesc: body.parent_info.company,
      InsuranceDesc: body.parent_info.insurance,
    }
    let dataPediatric = {
      Pob: body.pediatric.pob,
      BloodGroup: body.pediatric.blood_group,
      Weight: body.pediatric.weight,
      Height: body.pediatric.length,
      head: body.pediatric.head,
      Delivery: body.pediatric.delivery,
      DeliveryScore1: body.pediatric.deliveryscore1,
      DeliveryScore2: body.pediatric.deliveryscore2,
      Tsh: body.pediatric.tsh,
      Pku: body.pediatric.pku,
      Hearing: body.pediatric.hearing,
      Problems: body.pediatric.problems,
      ProblemsComment: body.pediatric.c_problems,
      Delay: body.pediatric.delay,
      DelayComment: body.pediatric.c_delay,
      Drug: body.pediatric.drug,
      DrugComment: body.pediatric.c_drug,
      Food: body.pediatric.food,
      FoodComment: body.pediatric.c_food,
      Other: body.pediatric.other,
      Othercomment: body.pediatric.c_other,
      Illness: body.pediatric.illness,
      Curmed: body.pediatric.curmed,
      Hospitalization: body.pediatric.hospitalization,
      HospitalizationComment: body.pediatric.c_hospitalization,
      Siblings: body.siblings.siblings
    }
    let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${body.ID}'`
    let queryPediatric = `UPDATE Registration.Pediatric SET ? WHERE PatientID = '${body.ID}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryPediatric, dataPediatric);
    let valuesParent:  any[] = [] 
    await body.parent_info.parent.map((d: any) => {
      let parentdata = [
        body.ID,
        d.title,
        d.firstname,
        d.middlename,
        d.lastname,
        d.relation,
        d.phoneno,
        d.email,
        d.contactemergency,
        d.livewithperson,
        d.sameAddress ? body.permanent.country : d.country,
        d.sameAddress ? body.permanent.postcode : d.postcode,
        d.sameAddress ? body.permanent.subdistrict : d.subdistrict,
        d.sameAddress ? body.permanent.districtid : d.districtid,
        d.sameAddress ? body.permanent.address : d.address,
        d.sameAddress ? body.permanent.provinceid : d.provinceid,
        d.sameAddress
      ]
      valuesParent.push(parentdata) 
    })
    let deleteParent = `DELETE FROM Registration.Parent WHERE PatientID = '${body.ID}'`
    await repos.query(deleteParent);
    let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
    await repos.query(queryParent, [valuesParent]);
    if (body.siblings.family.length > 0) {
      let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${body.ID}'`
      await repos.query(deleteFamily);
      let valuesFamily: any[] = [] 
      body.siblings.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.ID, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    this.handleConsent(body.consent_form, body.ID)
    
    return
  }
  async approveAdult(body: any) {
    let repos = di.get("repos");
    let getComment = (type: string, data: any) => {
      if (type == 'alcohol') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
      } else if (type == 'exercise') {
        return `quantity: ${data.quantity}, comment: ${data.comment}`
      } else if (type == 'smoke') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
      }
    }
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
    let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${body.ID}'`
    
    let dataPermanent = {
      Country: body.permanent.country,
      Postcode: body.permanent.postcode,
      Subdistrict: body.permanent.subdistrict,
      District: body.permanent.districtid,
      Address: body.permanent.address,
      Province: body.permanent.provinceid,
      sameAddress: null
    }
    let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 0`
    
    let dataPresent = {
      Country: body.present.sameAddress ? body.permanent.country : body.present.country,
      Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
      Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
      District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
      Address: body.present.sameAddress ? body.permanent.address : body.present.address,
      Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
      sameAddress: body.present.sameAddress
    }
    let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 1`

    let dataEmergency = {
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
    let queryEmergency = `UPDATE Registration.Patient_Emergency SET ? WHERE PatientID = '${body.ID}'`

    let financialDob = new Date(body.financial.dob)
    let dataFinancial = {
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
    let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${body.ID}'`
    let dataHistory = {
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
    let queryHistory = `UPDATE Registration.Patient_History SET ? Where PatientID = '${body.ID}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryEmergency, dataEmergency)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryHistory, dataHistory);

    if (body.personal_history.family.length > 0) {
      let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${body.ID}'`
      await repos.query(deleteFamily);
      let valuesFamily: any[] = [] 
      body.personal_history.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.ID, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    let deleteSocial = `DELETE FROM Registration.Patient_Social WHERE PatientID = '${body.ID}'`
    await repos.query(deleteSocial);
    if (body.personal_history.exercise.status != null) {
      let dataExercise = {
        PatientID: body.ID,
        Habit: 'exercise',
        Status: body.personal_history.exercise.status,
        Quantity: body.personal_history.exercise.quantity,
        Detail: null,
        Comment: body.personal_history.exercise.comment
      }
      let insertExercise = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertExercise, dataExercise)
    }
    if (body.personal_history.alcohol.status != null) {
      let dataAlcohol = {
        PatientID: body.ID,
        Habit: 'alcohol',
        Status: body.personal_history.alcohol.status,
        Quantity: body.personal_history.alcohol.quantity,
        Detail: JSON.stringify(body.personal_history.alcohol.detail),
        Comment: body.personal_history.alcohol.comment
      }
      let insertAlcohol = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertAlcohol, dataAlcohol)
    }
    if (body.personal_history.drugabuse.status != null) {
      let dataDrugabuse = {
        PatientID: body.ID,
        Habit: 'drugabuse',
        Status: body.personal_history.drugabuse.status,
        Quantity: body.personal_history.drugabuse.quantity,
        Detail: JSON.stringify(body.personal_history.drugabuse.detail),
        Comment: body.personal_history.drugabuse.comment
      }
      let insertDrugabuse = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertDrugabuse, dataDrugabuse)
    }
    if (body.personal_history.smoke.status != null) {
      let dataSmoke = {
        PatientID: body.ID,
        Habit: 'smoke',
        Status: body.personal_history.smoke.status,
        Quantity: body.personal_history.smoke.quantity,
        Detail: JSON.stringify(body.personal_history.smoke.detail),
        Comment: body.personal_history.smoke.comment
      }
      let insertSmoke = `INSERT INTO Registration.Patient_Social SET ?`
      await repos.query(insertSmoke, dataSmoke)
    }
    this.handleConsent(body.consent_form, body.ID)
    let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${body.patient_info.nationality}`
    let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${body.patient_info.religion}`
    let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.patient_info.gender}`
    
    
    let Country = async (id: any) => {
      let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
      let country = await repos.query(queryCountry)
      if (!country.length) return null
      return country[0].Desc_EN
    }
    let Subdistrict = async (id: any) => {
      let querySubdistrict = `SELECT * FROM Registration.CT_CityArea_1 WHERE ID = ${id}`
      let subdistrict = await repos.query(querySubdistrict)
      if (!subdistrict.length) return null
      return subdistrict[0].Desc_TH
    }
    let District = async (id: any) => {
      let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
      let district = await repos.query(queryDistrict)
      if (!district.length) return ''
      return district[0].Desc_TH
    }
    let Province = async (id: any) => {
      let queryProvince = `SELECT * FROM Registration.CT_Province WHERE ID = ${id}`
      let provice = await repos.query(queryProvince)
      if (!provice.length) return ''
      return provice[0].Desc_TH
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
    let Nation = await repos.query(queryNation)
    let Religion = await repos.query(queryReligion)
    let Gender = await repos.query(queryGender)
    
    
    let family = await Promise.all(body.personal_history.family.map(async (item: any): Promise<any> => {
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
    let rpa = {
      "data":{
        "server": rpaSetting.SERVER,
        "server_type": rpaSetting.SERVER_TYPE,
        "id_patient_information":126,
        "patient_code":"9xkevj",
        "hn": null,
        "title_th": await Title(body.patient_info.title),
        "firstname_th": body.patient_info.firstname,
        "middlename_th": body.patient_info.middlename,
        "lastname_th": body.patient_info.lastname,
        "title_en":null,
        "firstname_en":null,
        "middlename_en":null,
        "lastname_en":null,
        "nationality": Nation[0].Desc_EN,
        "religion": body.patient_info.religion,
        "religion_desc": Religion[0].Desc_TH,
        "religion_desc_en": Religion[0].Desc_EN,
        "national_id":body.patient_info.national_id,
        "passport_id":body.patient_info.passport,
        "dob": dateDob,
        "age":null,
        "gender": body.patient_info.gender,
        "gender_desc_en":Gender[0].Desc_EN,
        "gender_desc_th":Gender[0].Desc_TH,
        "marital_status": await checkstatus(body.patient_info.marital_status),
        "preferrend_language": await PreferredLanguage(body.patient_info.preferredlanguage),
        "occupation":body.patient_info.occupation,
        "mobile_phone":body.patient_info.phone_no,
        "email":body.patient_info.email,
        "home_telephone":body.patient_info.homephone,
        "office_telephone":body.patient_info.officephone,
        "permanent_address": body.permanent.address,
        "permanent_sub_district": await Subdistrict(body.permanent.subdistrict),
        "permanent_district": await District(body.permanent.districtid),
        "permanent_province": await Province(body.permanent.provinceid),
        "permanent_postcode": body.permanent.postcode,
        "permanent_country": await Country(body.permanent.country),
        "same_permanent": body.present.sameAddress ? 1 : 0,
        "present_address":body.present.sameAddress ? body.permanent.address : body.present.address,
        "present_sub_district":body.present.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(body.present.subdistrict),
        "present_district":body.present.sameAddress ? await District(body.permanent.districtid) : await District(body.present.districtid),
        "present_province":body.present.sameAddress ? await Province(body.permanent.provinceid) : await Province(body.present.provinceid),
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
        "ec_sub_district":body.emergency.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(body.emergency.subdistrict),
        "ec_district":body.emergency.sameAddress ? await District(body.permanent.districtid) : await District(body.emergency.districtid),
        "ec_province":body.emergency.sameAddress ? await Province(body.permanent.provinceid) : await Province(body.emergency.provinceid),
        "ec_postcode":body.emergency.sameAddress ? body.permanent.postcode : body.emergency.postcode,
        "ec_country":body.emergency.sameAddress ? await Country(body.permanent.country) : await Country(body.emergency.country),
        "fi_payment_method":body.financial.payment_method,
        "fi_company":body.financial.company,
        "date_created":null,
        "date_updated":null,
        "social_list": JSON.parse(JSON.stringify(social)),
        "family_list": JSON.parse(JSON.stringify(family)),
        "site": body.site,
        "location": body.location.CTLOC_Desc,
        "Truama":"No",
        "ARI":"No",
        "location_register": "1-Medical Record Department",
        "access_profile": "Registration Staff"
        
      }
    }
    let time = new Date();
    const filename = `RPA_Register_Adult_${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}_${time.getTime()}.txt`
    const path = '/Process'
    await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa  })
    return
    
  }
  async approveChild(body: any) {
    let repos = di.get("repos");
    let dateDob = new Date(body.general_info.dob)
    let dataInfo = {
      Title: body.general_info.title,
      Firstname: body.general_info.firstname,
      Middlename: body.general_info.middlename,
      Lastname: body.general_info.lastname,
      DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
      Gender: body.general_info.gender,
      Nationality: body.general_info.nationality,
      PhoneNo: body.general_info.phone_no,
      Email: body.general_info.email,
      Type: body.type,
      Site: body.site
    }
    let queryInfo = `UPDATE Registration.Patient_Info SET ? WHERE ID = '${body.ID}'`
    let dataPermanent = {
      Country: body.permanent.country,
      Postcode: body.permanent.postcode,
      Subdistrict: body.permanent.subdistrict,
      District: body.permanent.districtid,
      Address: body.permanent.address,
      Province: body.permanent.provinceid,
      sameAddress: null
    }
    let queryPermanent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 0`
    let dataPresent = {
      Country: body.present.sameAddress ? body.permanent.country : body.present.country,
      Postcode: body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
      Subdistrict: body.present.sameAddress ? body.permanent.subdistrict : body.present.subdistrict,
      District: body.present.sameAddress ? body.permanent.districtid : body.present.districtid,
      Address: body.present.sameAddress ? body.permanent.address : body.present.address,
      Province: body.present.sameAddress ? body.permanent.provinceid : body.present.provinceid,
      sameAddress: body.present.sameAddress
    }
    let queryPresent = `UPDATE Registration.Patient_Address SET ? WHERE PatientID = '${body.ID}' And Type = 1`
    let dataFinancial = {
      SelfPay: _.indexOf(body.parent_info.payment_method, 'Self pay') >= 0 ? 1 : 0,
      CompanyContact: _.indexOf(body.parent_info.payment_method, 'Company contract') >= 0 ? 1 : 0,
      Insurance: _.indexOf(body.parent_info.payment_method, 'Insurance') >= 0 ? 1 : 0,
      CompanyDesc: body.parent_info.company,
      InsuranceDesc: body.parent_info.insurance,
    }
    let dataPediatric = {
      Pob: body.pediatric.pob,
      BloodGroup: body.pediatric.blood_group,
      Weight: body.pediatric.weight,
      Height: body.pediatric.length,
      head: body.pediatric.head,
      Delivery: body.pediatric.delivery,
      DeliveryScore1: body.pediatric.deliveryscore1,
      DeliveryScore2: body.pediatric.deliveryscore2,
      Tsh: body.pediatric.tsh,
      Pku: body.pediatric.pku,
      Hearing: body.pediatric.hearing,
      Problems: body.pediatric.problems,
      ProblemsComment: body.pediatric.c_problems,
      Delay: body.pediatric.delay,
      DelayComment: body.pediatric.c_delay,
      Drug: body.pediatric.drug,
      DrugComment: body.pediatric.c_drug,
      Food: body.pediatric.food,
      FoodComment: body.pediatric.c_food,
      Other: body.pediatric.other,
      Othercomment: body.pediatric.c_other,
      Illness: body.pediatric.illness,
      Curmed: body.pediatric.curmed,
      Hospitalization: body.pediatric.hospitalization,
      HospitalizationComment: body.pediatric.c_hospitalization,
      Siblings: body.siblings.siblings
    }
    let queryFinancial = `UPDATE Registration.Patient_Financial SET ? WHERE PatientID = '${body.ID}'`
    let queryPediatric = `UPDATE Registration.Pediatric SET ? WHERE PatientID = '${body.ID}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryPediatric, dataPediatric);
    let valuesParent:  any[] = [] 
    await body.parent_info.parent.map((d: any) => {
      let parentdata = [
        body.ID,
        d.title,
        d.firstname,
        d.middlename,
        d.lastname,
        d.relation,
        d.phoneno,
        d.email,
        d.contactemergency,
        d.livewithperson,
        d.sameAddress ? body.permanent.country : d.country,
        d.sameAddress ? body.permanent.postcode : d.postcode,
        d.sameAddress ? body.permanent.subdistrict : d.subdistrict,
        d.sameAddress ? body.permanent.districtid : d.districtid,
        d.sameAddress ? body.permanent.address : d.address,
        d.sameAddress ? body.permanent.provinceid : d.provinceid,
        d.sameAddress
      ]
      valuesParent.push(parentdata) 
    })
    let deleteParent = `DELETE FROM Registration.Parent WHERE PatientID = '${body.ID}'`
    await repos.query(deleteParent);
    let queryParent = `INSERT INTO Registration.Parent (PatientID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
    await repos.query(queryParent, [valuesParent]);
    if (body.siblings.family.length > 0) {
      let deleteFamily = `DELETE FROM Registration.Family_History WHERE PatientID = '${body.ID}'`
      await repos.query(deleteFamily);
      let valuesFamily: any[] = [] 
      body.siblings.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.ID, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Registration.Family_History (PatientID, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    this.handleConsent(body.consent_form, body.ID)
    let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${body.general_info.nationality}`
    let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.general_info.gender}`
    
    let Country = async (id: any) => {
      let queryCountry = `SELECT * FROM Registration.CT_Country Where ID = ${id}`
      let country = await repos.query(queryCountry)
      if (!country.length) return ''
      return country[0].Desc_EN
    }
    let Subdistrict = async (id: any) => {
      let querySubdistrict = `SELECT * FROM Registration.CT_CityArea_1 WHERE ID = ${id}`
      let subdistrict = await repos.query(querySubdistrict)
      if (!subdistrict.length) return ''
      return subdistrict[0].Desc_TH
    }
    let District = async (id: any) => {
      let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
      let district = await repos.query(queryDistrict)
      if (!district.length) return ''
      return district[0].Desc_TH
    }
    let Province = async (id: any) => {
      let queryProvince = `SELECT * FROM Registration.CT_Province WHERE ID = ${id}`
      let provice = await repos.query(queryProvince)
      if (!provice.length) return ''
      return provice[0].Desc_TH
    }
    let PreferredLanguage = async (id: any) => {
      let querySubdistrict = `SELECT Desc_EN FROM Registration.CT_PreferredLanguage WHERE ID = ${id}`
      let subdistrict = await repos.query(querySubdistrict)
      if (!subdistrict.length) return ''
      return subdistrict[0].Desc_EN
    }
    let Nation = await repos.query(queryNation)
    let Gender = await repos.query(queryGender)
    let family = await body.siblings.family.map((d: any) => {
      let data = {
        "id_patient_family": null,
        "id_patient_information": null,
        "relation": d.person,
        "disease": d.illness,
        "start": 0,
        "end": 0,
        "comment":null
      }
      return data
    })
    let social: any = new Array()
    
    let datadrugabuse = {
      "id_patient_social": null,
      "id_patient_information": null,
      "habit":"Substance Abuse",
      "quality": null,
      "detail": null,
      "comment": body.pediatric.c_drug
    }
    
    if (body.pediatric.drug) social.push(datadrugabuse)
    let emergency = body.parent_info.parent.find((d: any) => d.contactemergency)
    let rpa = {
      "data":{
        "server": rpaSetting.SERVER,
        "server_type": rpaSetting.SERVER_TYPE,
        "id_patient_information":126,
        "patient_code":"9xkevj",
        "hn":null,
        "title_th": body.general_info.title,
        "firstname_th": body.general_info.firstname,
        "middlename_th": body.general_info.middlename,
        "lastname_th": body.general_info.lastname,
        "title_en":null,
        "firstname_en":null,
        "middlename_en":null,
        "lastname_en":null,
        "nationality": Nation[0].Desc_EN,
        "religion": null,
        "religion_desc": null,
        "national_id": null,
        "passport_id": null,
        "dob":`${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
        "age":null,
        "gender": body.general_info.gender,
        "gender_desc_en":Gender[0].Desc_EN,
        "gender_desc_th":Gender[0].Desc_TH,
        "marital_status": null,
        "preferrend_language": null,
        "occupation": null,
        "mobile_phone":body.general_info.phone_no,
        "email":body.general_info.email,
        "home_telephone": null,
        "office_telephone": null,
        "permanent_address": body.permanent.address,
        "permanent_sub_district": await Subdistrict(body.permanent.subdistrict),
        "permanent_district": await District(body.permanent.districtid),
        "permanent_province": await Province(body.permanent.provinceid),
        "permanent_postcode": body.permanent.postcode,
        "permanent_country": await Country(body.permanent.country),
        "same_permanent": body.present.sameAddress ? 1 : 0,
        "present_address":body.present.sameAddress ? body.permanent.address : body.present.address,
        "present_sub_district":body.present.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(body.present.subdistrict),
        "present_district":body.present.sameAddress ? await District(body.permanent.districtid) : await District(body.present.districtid),
        "present_province":body.present.sameAddress ? await Province(body.permanent.provinceid) : await Province(body.present.provinceid),
        "present_postcode":body.present.sameAddress ? body.permanent.postcode : body.present.postcode,
        "present_country":body.present.sameAddress ? await Country(body.permanent.country) : await Country(body.present.country),
        "ec_firstname": emergency != undefined ? emergency.firstname : null,
        "ec_lastname": emergency != undefined ? emergency.lastname : null,
        "ec_relationship":null,
        "ec_relationship_other": emergency != undefined ? emergency.relation : null,
        "ec_telephone": emergency != undefined ? emergency.phoneno : null,
        "ec_email": emergency != undefined ? emergency.email : null,
        "ec_address_same_patient": emergency != undefined ? emergency.sameAddress ? 1 : 0 : null,
        "ec_address":emergency != undefined ? emergency.sameAddress ? body.permanent.address : emergency.address : null,
        "ec_sub_district":emergency != undefined ? emergency.sameAddress ? await Subdistrict(body.permanent.subdistrict) : await Subdistrict(emergency.subdistrict) : null,
        "ec_district": emergency != undefined ? emergency.sameAddress ? await District(body.permanent.districtid) : await District(emergency.districtid) : null,
        "ec_province": emergency != undefined ? emergency.sameAddress ? await Province(body.permanent.provinceid) : await Province(emergency.provinceid) : null,
        "ec_postcode": emergency != undefined ? emergency.sameAddress ? body.permanent.postcode : emergency.postcode : null,
        "ec_country": emergency != undefined ? emergency.sameAddress ? await Country(body.permanent.country) : await Country(emergency.country) : null,
        "fi_payment_method":body.parent_info.payment_method,
        "fi_company":body.parent_info.company,
        "date_created":null,
        "date_updated":null,
        "social_list":social,
        "family_list":family,
        "site": body.site,
        "location": body.location.CTLOC_Desc,
        "Truama":"No",
        "ARI":"No", 
        "location_register": "1-Medical Record Department",
        "access_profile": "Registration Staff"
      }
    }
    
    let time = new Date();
    const filename = `${body.ID}+${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}+${time.getTime()}.txt`
    const path = '/Process'
    let sendrpa = await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa })
    return
  }
  updateData() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get("repos");
      if (body.type == 0) {
        await this.updateAdult(body)
        res.send({message: 'Success'})
      } else {
        await this.updateChild(body)
        res.send({message: 'Success'})
      }
    }
  }
  approveData() {
    return async (req: Request, res: Response) => {
      let body = req.body
      let repos = di.get("repos");
      if (body.type == 0) {
        await this.approveAdult(body)
        res.send({message: 'Success'})
      } else {
        await this.approveChild(body)
        res.send({message: 'Success'})
      }
    }
  }
  saveSignatureApprove() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, id, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Registration.Patient_Info SET Approve=1 WHERE ID=${id};`
      let insertSignature = `INSERT INTO Registration.Signature (PatientID, HashSiganture, Signature, SignType) VALUES(${id}, '${signatureHash}', '${signatureImage}', '${signType}');`
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
      .post("/update", route.updateData())
      .post("/getPendingData", route.getPendingData())
      .post("/approve", route.approveData())
      .post("/signatureApprove", route.saveSignatureApprove())
      .post("/getApprovedData", route.getApprovedData())

export const register = router;
