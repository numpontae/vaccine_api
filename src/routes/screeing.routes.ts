import { Request, Response, Router } from "express";
import { di } from "../di";
import * as _ from "lodash";
import CryptoJS from "crypto-js";
const axios = require('axios');
import { rpaSetting } from "../config/config";

class screeningRoute {
  async getPatientByHN(hn: any) {
    let repos = di.get("repos");
    let query = `SELECT PI.* FROM Screening.Patient_Info PI `
    query += ` WHERE 1 = 1 `
    query += ` AND PI.HN = '${hn}' `
    let info = await repos.query(query)

    if (info[0].Type == 0) {
      let queryAddress = `SELECT * FROM Screening.Patient_Address WHERE HN = '${hn}' ORDER BY Type `
      let queryEmergency = `SELECT * FROM Screening.Patient_Emergency WHERE HN = '${hn}' `
      let queryFinancial = `SELECT * FROM Screening.Patient_Financial WHERE HN = '${hn}' `
      let queryHistory = `SELECT * FROM Screening.Patient_History WHERE HN = '${hn}' `
      let queryFamily = `SELECT * FROM Screening.Family_History WHERE HN = '${hn}' `
      let querySocial = `SELECT * FROM Screening.Patient_Social WHERE HN = '${hn}' `
      let queryConsent = `SELECT * FROM Screening.Consent WHERE HN = '${hn}' `
      // let queryPatientSignature = `SELECT Signature, Createdate, Createtime FROM Screening.Signature Where HN = '${info[0].HN}' And SignType = 'Patient' Order By ID Desc`
      // let queryStaffSignature = `SELECT Signature, Createdate, Createtime FROM Screening.Signature Where HN = '${info[0].HN}' And SignType = 'Approver' Order By ID Desc`
      
      let address = await repos.query(queryAddress)
      let emergency = await repos.query(queryEmergency)
      let financial = await repos.query(queryFinancial)
      let history = await repos.query(queryHistory)
      let family = await repos.query(queryFamily)
      let social = await repos.query(querySocial)
      let consent = await repos.query(queryConsent)
      // let patientSignature = await repos.query(queryPatientSignature)
      // patientSignature[0].Createdate.setHours(patientSignature[0].Createdate.getHours() + 7);
      // let staffSignature = await repos.query(queryStaffSignature)
      // staffSignature[0].Createdate.setHours(staffSignature[0].Createdate.getHours() + 7);
      let dataSocial = social.map((d: any) => {
        let data = {
          Habit: d.Habit,
          Status: d.Status,
          Quantity: d.Quantity,
          DurationQuantity: d.DurationQuantity,
          DurationUnit: d.DurationUnit,
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
        Present: address[0],
        Permanent: address[1] ? address[1] : {sameAddress : null, address : null},
        Emergency: {
          Firstname: emergency[0] ? emergency[0].Firstname : null,
          Lastname: emergency[0] ? emergency[0].Lastname : null,
          Relation: emergency[0] ? emergency[0].Relation : null,
          sameAddress: emergency[0] ? emergency[0].sameAddress : null,
          Country: emergency[0] ? emergency[0].Country : null,
          Province: emergency[0] ? emergency[0].Province : null,
          Postcode: emergency[0] ? emergency[0].Postcode : null,
          Subdistrict: emergency[0] ? emergency[0].Subdistrict : null,
          District: emergency[0] ? emergency[0].District : null,
          Address: emergency[0] ? emergency[0].Address : null,
          PhoneNo: emergency[0] ? emergency[0].PhoneNo : null,
          Email: emergency[0] ? emergency[0].Email : null,
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
        Consent: consent,
        // PatientSignature: patientSignature,
        // StaffSignature: staffSignature,
      }
      return result
    } else {
      let queryAddress = `SELECT * FROM Screening.Patient_Address WHERE HN = ${hn} ORDER BY Type`
      let queryParent = `SELECT p.* FROM Screening.Parent p WHERE p.HN = ${hn}`
      let queryFinancial = `SELECT * FROM Screening.Patient_Financial WHERE HN = ${hn}`
      let queryFamily = `SELECT * FROM Screening.Family_History WHERE HN = ${hn}`
      let queryPediatric = `SELECT * FROM Screening.Pediatric WHERE HN = ${hn}`
      let queryConsent = `SELECT * FROM Screening.Consent WHERE HN = ${hn}`
      let address = await repos.query(queryAddress)
      let parent = await repos.query(queryParent)
      let financial = await repos.query(queryFinancial)
      let family = await repos.query(queryFamily)
      let pediatric = await repos.query(queryPediatric)
      let consent = await repos.query(queryConsent)
      let payment = []
      let familylist: any = []
      let filterpresent = await address.filter((d:any) => d.Type == 0)
      let filterpermanent = await address.filter((d:any) => d.Type == 1)
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
        Present: filterpresent[0],
        Permanent: filterpermanent[0],
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
    // let repos = di.get("repos");
    // let query = `SELECT PI.* FROM Screening.Patient_Info PI`
    // query += ` WHERE 1 = 1`
    // query += ` AND PI.HN = '${hn}'`
    // let info = await repos.query(query)
    // if (info[0].Type == 0) {
    //   let queryAddress = `SELECT * FROM Screening.Patient_Address WHERE HN = '${hn}' ORDER BY Type`
    //   let queryEmergency = `SELECT * FROM Screening.Patient_Emergency WHERE HN = '${hn}'`
    //   let address = await repos.query(queryAddress)
    //   let emergency = await repos.query(queryEmergency)
    //   let filterpresent: any[] = await address.filter((d:any) => d.Type == 0)
    //   let familylist: any = []
    //   let dataSocial: any = []
    //   let result = {
    //     Info: info[0],
    //     Present: filterpresent[0],
    //     Emergency: {
    //       Firstname: emergency.length ? emergency[0].Firstname : null,
    //       Lastname: emergency.length ? emergency[0].Lastname : null,
    //       Relation: emergency.length ? emergency[0].Relation : null,
    //       sameAddress: emergency.length ? emergency[0].sameAddress : null,
    //       Country: emergency.length ? emergency[0].Country : null,
    //       Province: emergency.length ? emergency[0].Province : null,
    //       Postcode: emergency.length ? emergency[0].Postcode : null,
    //       Subdistrict: emergency.length ? emergency[0].Subdistrict : null,
    //       District: emergency.length ? emergency[0].District : null,
    //       Address: emergency.length ? emergency[0].Address : null,
    //       PhoneNo: emergency.length ? emergency[0].PhoneNo : null,
    //       Email: emergency.length ? emergency[0].Email : null,
    //     },
    //     Financial: {
    //       payment_method: [],
    //       showInsurance: false,
    //       showCompany: false,
    //       InsuranceDesc: null,
    //       CompanyDesc: null,
    //       PaymentAs: null,
    //       Title: null,
    //       Firstname: null,
    //       Lastname: null,
    //       DOB: null,
    //       Aforemention: null,
    //     },
    //     Family: familylist,
    //     SocialHistory: dataSocial
    //   }
    //   return result
    // }
  }
  postScreening() {
    return async (req: Request, res: Response) => {
      // Get Screeing Data
      //console.log(result);
      //var CronJob = require('cron').CronJob;
      // var job = new CronJob('00 50 23 * * 0-6',async function() {
        let body = req.body;
        console.log("Get Patent Info at " + new Date())
      let repos = di.get("cache");
      let result: any = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	PAPMI_No "HN",
                    PAPMI_Title_DR->TTL_RowId "Title",
                    PAPMI_Name "Firstname",
                    PAPMI_Name2 "Lastname",
                    PAPMI_Name5 "FirstnameEn",
                    PAPMI_Name7 "LastnameEn",
                    tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                    PAPMI_Sex_DR "Gender",
                    PAPER_Nation_DR "Nationality",
                    PAPER_Religion_DR "Religion",
                  PAPER_PrefLanguage_DR "PreferredLanguage",
                    PAPMI_Email "Email",
                    PAPER_ID "NationalID",
                    PAPER_PassportNumber "Passport",
                    SUBSTRING(PAPER_Marital_DR->CTMAR_Desc, CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc)+1, (LENGTH(PAPER_Marital_DR->CTMAR_Desc)-CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc))-1) "MaritalStatus",
                    PAPER_SocialStatus_DR->SS_Desc "Occupation",
                    PAPER_MobPhone "PhoneNo",
                    PAPER_TelH "Homephone" ,
              CASE
                    WHEN PAPMI_Title_DR LIKE '%e%' THEN 'en'
                    ELSE 'th'
              END "DefaultLanguage",
              CASE
                  WHEN PAPER_AgeYr > 15 THEN 0
                   ELSE 1
              END "type"
                FROM PA_PatMas
                LEFT JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                WHERE PAPMI_No IS NOT NULL AND PAPER_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE`;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      let query_1 = `REPLACE INTO Screening.Patient_Info SET ? `
      
      await result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
        let query_2 = `REPLACE INTO Screening.Patient_Financial (HN) VALUES ('${d.HN}') `
        repos.query(query_2, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        }); 
        let query_3 = `REPLACE INTO Screening.Patient_History (HN) VALUES ('${d.HN}') `
        repos.query(query_3, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        }); 
      })
      let query = `UPDATE Screening.Patient_Financial pf1 
      INNER JOIN Screening.Patient_Info pi1 ON pf1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.NationalID = pi2.NationalID 
      INNER JOIN Registration.Patient_Financial pf2 ON pf2.PatientID = pi2.ID 
      SET pf1.SelfPay = pf2.SelfPay,
          pf1.CompanyContact = pf2.CompanyContact,
          pf1.Insurance = pf2.Insurance,
          pf1.CompanyDesc = pf2.CompanyDesc,
          pf1.InsuranceDesc = pf2.InsuranceDesc,
          pf1.PaymentAs = pf2.PaymentAs,
          pf1.Title = pf2.Title,
          pf1.Firstname = pf2.Firstname,
          pf1.Lastname = pf2.Lastname,
          pf1.DOB = pf2.DOB,
          pf1.Aforemention = pf2.Aforemention
      WHERE pi1.NationalID IS NOT NULL AND pf1.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE()  `
      await  repos.query(query)
      query = `UPDATE Screening.Patient_Financial pf1 
      INNER JOIN Screening.Patient_Info pi1 ON pf1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.Firstname = pi2.Firstname AND pi1.Lastname = pi2.Lastname AND pi1.DOB = pi2.DOB 
      INNER JOIN Registration.Patient_Financial pf2 ON pf2.PatientID = pi2.ID 
      SET pf1.SelfPay = pf2.SelfPay,
          pf1.CompanyContact = pf2.CompanyContact,
          pf1.Insurance = pf2.Insurance,
          pf1.CompanyDesc = pf2.CompanyDesc,
          pf1.InsuranceDesc = pf2.InsuranceDesc,
          pf1.PaymentAs = pf2.PaymentAs,
          pf1.Title = pf2.Title,
          pf1.Firstname = pf2.Firstname,
          pf1.Lastname = pf2.Lastname,
          pf1.DOB = pf2.DOB,
          pf1.Aforemention = pf2.Aforemention
      WHERE pi1.NationalID IS NULL AND pf1.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE() `
      await  repos.query(query)
      
      query = `UPDATE Screening.Patient_History ph1 
      INNER JOIN Screening.Patient_Info pi1 ON ph1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.NationalID = pi2.NationalID 
      INNER JOIN Registration.Patient_History ph2 ON ph2.PatientID = pi2.ID 
      SET ph1.MaritalStatus = ph2.MaritalStatus,
          ph1.Children = ph2.Children,
          ph1.Diseases = ph2.Diseases,
          ph1.Medication = ph2.Medication,
          ph1.CommentMedication = ph2.CommentMedication,
          ph1.Hospitalization = ph2.Hospitalization,
          ph1.CommentHospitalization = ph2.CommentHospitalization,
          ph1.Physical = ph2.Physical,
          ph1.CommentPhysical = ph2.CommentPhysical,
          ph1.Exercise = ph2.Exercise,
          ph1.Pregnant = ph2.Pregnant,
          ph1.CommentPregnant = ph2.CommentPregnant,
          ph1.Giver = ph2.Giver,
          ph1.CommentGiver = ph2.CommentGiver,
          ph1.AbsenceFromWork = ph2.AbsenceFromWork,
          ph1.Reimbursement = ph2.Reimbursement,
          ph1.GovernmentReimbursement = ph2.GovernmentReimbursement,
          ph1.StateEnterprise = ph2.StateEnterprise,
          ph1.Authorize = ph2.Authorize,
          ph1.CommentAuthorize = ph2.CommentAuthorize,
          ph1.Spiritual = ph2.Spiritual,
          ph1.CommentSpiritual = ph2.CommentSpiritual,
          ph1.Allergies = ph2.Allergies,
          ph1.CommentAllergies = ph2.CommentAllergies,
          ph1.Alcohol = ph2.Alcohol,
          ph1.DrugAbuse = ph2.DrugAbuse,
          ph1.Smoke = ph2.Smoke,
          ph1.FatherAlive = ph2.FatherAlive,
          ph1.FatherAge = ph2.FatherAge,
          ph1.CauseFather = ph2.CauseFather,
          ph1.MotherAlive = ph2.MotherAlive,
          ph1.MotherAge = ph2.MotherAge,
          ph1.CauseMother = ph2.CauseMother 
      WHERE pi1.NationalID IS NOT NULL AND ph1.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE()  `
      await  repos.query(query)
      query = `UPDATE Screening.Patient_History ph1 
      INNER JOIN Screening.Patient_Info pi1 ON ph1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.Firstname = pi2.Firstname AND pi1.Lastname = pi2.Lastname AND pi1.DOB = pi2.DOB 
      INNER JOIN Registration.Patient_History ph2 ON ph2.PatientID = pi2.ID 
      SET ph1.MaritalStatus = ph2.MaritalStatus,
          ph1.Children = ph2.Children,
          ph1.Diseases = ph2.Diseases,
          ph1.Medication = ph2.Medication,
          ph1.CommentMedication = ph2.CommentMedication,
          ph1.Hospitalization = ph2.Hospitalization,
          ph1.CommentHospitalization = ph2.CommentHospitalization,
          ph1.Physical = ph2.Physical,
          ph1.CommentPhysical = ph2.CommentPhysical,
          ph1.Exercise = ph2.Exercise,
          ph1.Pregnant = ph2.Pregnant,
          ph1.CommentPregnant = ph2.CommentPregnant,
          ph1.Giver = ph2.Giver,
          ph1.CommentGiver = ph2.CommentGiver,
          ph1.AbsenceFromWork = ph2.AbsenceFromWork,
          ph1.Reimbursement = ph2.Reimbursement,
          ph1.GovernmentReimbursement = ph2.GovernmentReimbursement,
          ph1.StateEnterprise = ph2.StateEnterprise,
          ph1.Authorize = ph2.Authorize,
          ph1.CommentAuthorize = ph2.CommentAuthorize,
          ph1.Spiritual = ph2.Spiritual,
          ph1.CommentSpiritual = ph2.CommentSpiritual,
          ph1.Allergies = ph2.Allergies,
          ph1.CommentAllergies = ph2.CommentAllergies,
          ph1.Alcohol = ph2.Alcohol,
          ph1.DrugAbuse = ph2.DrugAbuse,
          ph1.Smoke = ph2.Smoke,
          ph1.FatherAlive = ph2.FatherAlive,
          ph1.FatherAge = ph2.FatherAge,
          ph1.CauseFather = ph2.CauseFather,
          ph1.MotherAlive = ph2.MotherAlive,
          ph1.MotherAge = ph2.MotherAge,
          ph1.CauseMother = ph2.CauseMother 
      WHERE pi1.NationalID IS NULL AND ph1.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE() `
      await  repos.query(query)
      
      console.log("Get Patent Info Success at " + new Date())
      
      console.log("Get Patent Emergenct at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                    NOK.NOK_Name "Firstname", 
                    NOK.NOK_Name2 "Lastname",
                    NOK.NOK_Relation_DR "Relation",
                    NOK.NOK_Email "Email",
                    CASE
                        WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                        ELSE NOK.NOK_TelH
                    END "PhoneNo",
                    CASE 
                         WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                           AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                           OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                         ELSE NOK_Country_DR->CTCOU_RowId
                      END "Country",
                    NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                    NOK.NOK_CityArea_DR "Subdistrict",
                    NOK.NOK_CityCode_DR "District",
                    NOK.NOK_StNameLine1 "Address",
                    NOK.NOK_Province_DR "Province",
                    '0' "sameAddress"FROM PA_Nok Nok
                    Where NOK_PAPMI_ParRef->PAPMI_No IS NOT NULL AND NOK_ContactType_DR = 1 AND NOK_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE 
                    AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                    AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr > 15
                    ORDER BY NOK_PAPMI_ParRef Desc `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `REPLACE INTO Screening.Patient_Emergency SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
      });
      
      let query_3 = `UPDATE Screening.Patient_Emergency pe
        SET pe.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
        (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pe.Subdistrict limit 1) AND ca1.Zip_Code = pe.Postcode limit 1)
        WHERE pe.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE() `
        repos.query(query_3, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      console.log("Get Patent Emergenct Success at " + new Date())
      
      console.log("Get Patent Parent at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                    NOK.NOK_Name "Firstname", 
                    NOK.NOK_Name2 "Lastname",
                    NOK.NOK_Relation_DR "Relation",
                    NOK.NOK_Email "Email",
                    CASE
                        WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                        ELSE NOK.NOK_TelH
                    END "PhoneNo",
                    CASE 
                         WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                           AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                           OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                         ELSE NOK_Country_DR->CTCOU_RowId
                      END "Country",
                    NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                    NOK.NOK_CityArea_DR "Subdistrict",
                    NOK.NOK_CityCode_DR "District",
                    NOK.NOK_StNameLine1 "Address",
                    NOK.NOK_Province_DR "Province",
                    '0' "sameAddress"FROM PA_Nok Nok
                    Where NOK_PAPMI_ParRef->PAPMI_No IS NOT NULL AND NOK_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE 
                    AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                    AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr <= 15
                    ORDER BY NOK_PAPMI_ParRef Desc `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `REPLACE INTO Screening.Parent SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      console.log("Get Patent Parent Success at " + new Date())
      
      console.log("Get Patent Address at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT PAPMI_No "HN",
                    CASE 
                       WHEN PAPER_Country_DR IS NULL 
                       AND ((PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                       OR (PAPER_Zip_DR->CTZIP_Province_DR NOT IN ('77', '78') AND PAPER_Zip_DR->CTZIP_Province_DR IS NOT NULL)
                       OR (PAPER_Zip_DR->CTZIP_CITY_DR NOT IN ('1116', '936') AND PAPER_Zip_DR->CTZIP_CITY_DR IS NOT NULL)) THEN 2
                       ELSE PAPER_Country_DR
                      END "Country",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_Code
                      END "Postcode",
                        CASE
                       WHEN PAPER_Zip_DR->CTZIP_Province_DR IN ('77', '78') THEN null
                       ELSE PAPER_Zip_DR->CTZIP_Province_DR
                      END "Province",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_CITY_DR IN ('1116', '936') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_CITY_DR
                      END "District",
                      PAPER_CityArea_DR "Subdistrict",
                      PAPER_StName "Address",
                            '0' "Type"
                      FROM PA_PatMas
                        INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                        WHERE PAPMI_No IS NOT NULL AND PAPER_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE
                    `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      let query_del

      result.map((d: any) => {
        query_del = `DELETE FROM Screening.Patient_Address WHERE HN = '${d.HN}' AND Type = '${d.Type}' AND Type = 0 `
        repos.query(query_del,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          } 
        });
      });
      
      query_1 = `INSERT INTO Screening.Patient_Address SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      });

      
      let query_2 = `UPDATE Screening.Patient_Address pa
        SET pa.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
        (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pa.Subdistrict limit 1) AND ca1.Zip_Code = pa.Postcode limit 1)
        WHERE pa.Createdate BETWEEN ADDDATE(CURDATE(),-1) AND CURDATE() `
        repos.query(query_2, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
      console.log("Get Patent Parent Success at " + new Date())
      
      console.log("Get Patent Family at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT  FAM_PAPMI_ParRef->PAPMI_No "HN", 
                    FAM_Relation_DR "Person",
                    FAM_Desc "Disease"
                    FROM PA_Family
                    WHERE FAM_PAPMI_ParRef->PAPMI_No IS NOT NULL AND FAM_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `INSERT INTO Screening.Family_History SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      console.log("Get Patent Family Success at " + new Date())
      
      console.log("Get Patent Social at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT SCH_PAPMI_ParRef->PAPMI_No "HN", 
                    SCH_Habits_DR->HAB_Desc "Habit",
                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                      ELSE SCH_HabitsQty_DR->QTY_desc
                    END "Quantity", 
                    SCH_Desc "Comment",
                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                      ELSE 1
                    END "Status",
                    CASE
                      WHEN SCH_DuratDays is not null THEN SCH_DuratDays
                      WHEN SCH_DuratMonth is not null THEN SCH_DuratMonth
                      WHEN SCH_DuratYear is not null THEN SCH_DuratYear
                      ELSE NULL
                    END "DurationQuantity",
                    CASE
                      WHEN SCH_DuratDays is not null THEN 'Days'
                      WHEN SCH_DuratMonth is not null THEN 'Weeks'
                      WHEN SCH_DuratYear is not null THEN 'Years'
                      ELSE NULL
                    END "DurationUnit"
                    FROM PA_SocHist 
                    WHERE SCH_PAPMI_ParRef->PAPMI_No IS NOT NULL AND SCH_UpdateDate BETWEEN TO_DATE(CURRENT_DATE - 1) AND CURRENT_DATE `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `INSERT INTO Screening.Patient_Social SET ? `
      result.map((d: any) => {
        query_del = `DELETE FROM Screening.Patient_Social WHERE HN = '${d.HN}' AND Habit = '${d.Habit}' `
        repos.query(query_del,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      console.log("Get Patent Social Success at " + new Date())
      console.log("Finished Get Screening Data at " + new Date())
      
      
      
    };
  }
  async postScreeningByNationID(nation_id: any) {
        console.log("Get Patent Info at " + new Date())
        let repos = di.get("cache");
        let result: any = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	PAPMI_No "HN",
                    PAPMI_Title_DR->TTL_RowId "Title",
                    PAPMI_Name "Firstname",
                    PAPMI_Name2 "Lastname",
                    PAPMI_Name5 "FirstnameEn",
                    PAPMI_Name7 "LastnameEn",
                    tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                    PAPMI_Sex_DR "Gender",
                    PAPER_Nation_DR "Nationality",
                    PAPER_Religion_DR "Religion",
                  PAPER_PrefLanguage_DR "PreferredLanguage",
                    PAPMI_Email "Email",
                    PAPER_ID "NationalID",
                    PAPER_PassportNumber "Passport",
                    SUBSTRING(PAPER_Marital_DR->CTMAR_Desc, CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc)+1, (LENGTH(PAPER_Marital_DR->CTMAR_Desc)-CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc))-1) "MaritalStatus",
                    PAPER_SocialStatus_DR->SS_Desc "Occupation",
                    PAPER_MobPhone "PhoneNo",
                    PAPER_TelH "Homephone" ,
              CASE
                    WHEN PAPMI_Title_DR LIKE '%e%' THEN 'en'
                    ELSE 'th'
              END "DefaultLanguage",
              CASE
                  WHEN PAPER_AgeYr > 15 THEN 0
                   ELSE 1
              END "type"
                FROM PA_PatMas
                LEFT JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                WHERE PAPMI_No IS NOT NULL AND PAPMI_ID = '${nation_id}' `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      let query_1 = `REPLACE INTO Screening.Patient_Info SET ? `
      
      await result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
        let query_2 = `REPLACE INTO Screening.Patient_Financial (HN) VALUES ('${d.HN}') `
        repos.query(query_2, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        }); 
        let query_3 = `REPLACE INTO Screening.Patient_History (HN) VALUES ('${d.HN}') `
        repos.query(query_3, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        }); 
      })
      console.log("Update Financial at " + new Date())
      let query = `UPDATE Screening.Patient_Financial pf1 
      INNER JOIN Screening.Patient_Info pi1 ON pf1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.NationalID = pi2.NationalID 
      INNER JOIN Registration.Patient_Financial pf2 ON pf2.PatientID = pi2.ID 
      SET pf1.SelfPay = pf2.SelfPay,
          pf1.CompanyContact = pf2.CompanyContact,
          pf1.Insurance = pf2.Insurance,
          pf1.CompanyDesc = pf2.CompanyDesc,
          pf1.InsuranceDesc = pf2.InsuranceDesc,
          pf1.PaymentAs = pf2.PaymentAs,
          pf1.Title = pf2.Title,
          pf1.Firstname = pf2.Firstname,
          pf1.Lastname = pf2.Lastname,
          pf1.DOB = pf2.DOB,
          pf1.Aforemention = pf2.Aforemention
      WHERE  pi1.NationalID = '${nation_id}'  `
      await  repos.query(query)
      
      console.log("Update History at " + new Date())
      query = `UPDATE Screening.Patient_History ph1 
      INNER JOIN Screening.Patient_Info pi1 ON ph1.HN = pi1.HN
      INNER JOIN Registration.Patient_Info pi2 ON pi1.NationalID = pi2.NationalID 
      INNER JOIN Registration.Patient_History ph2 ON ph2.PatientID = pi2.ID 
      SET ph1.MaritalStatus = ph2.MaritalStatus,
          ph1.Children = ph2.Children,
          ph1.Diseases = ph2.Diseases,
          ph1.Medication = ph2.Medication,
          ph1.CommentMedication = ph2.CommentMedication,
          ph1.Hospitalization = ph2.Hospitalization,
          ph1.CommentHospitalization = ph2.CommentHospitalization,
          ph1.Physical = ph2.Physical,
          ph1.CommentPhysical = ph2.CommentPhysical,
          ph1.Exercise = ph2.Exercise,
          ph1.Pregnant = ph2.Pregnant,
          ph1.CommentPregnant = ph2.CommentPregnant,
          ph1.Giver = ph2.Giver,
          ph1.CommentGiver = ph2.CommentGiver,
          ph1.AbsenceFromWork = ph2.AbsenceFromWork,
          ph1.Reimbursement = ph2.Reimbursement,
          ph1.GovernmentReimbursement = ph2.GovernmentReimbursement,
          ph1.StateEnterprise = ph2.StateEnterprise,
          ph1.Authorize = ph2.Authorize,
          ph1.CommentAuthorize = ph2.CommentAuthorize,
          ph1.Spiritual = ph2.Spiritual,
          ph1.CommentSpiritual = ph2.CommentSpiritual,
          ph1.Allergies = ph2.Allergies,
          ph1.CommentAllergies = ph2.CommentAllergies,
          ph1.Alcohol = ph2.Alcohol,
          ph1.DrugAbuse = ph2.DrugAbuse,
          ph1.Smoke = ph2.Smoke,
          ph1.FatherAlive = ph2.FatherAlive,
          ph1.FatherAge = ph2.FatherAge,
          ph1.CauseFather = ph2.CauseFather,
          ph1.MotherAlive = ph2.MotherAlive,
          ph1.MotherAge = ph2.MotherAge,
          ph1.CauseMother = ph2.CauseMother 
      WHERE pi1.NationalID = '${nation_id}'  `
      await  repos.query(query)
      
      
      console.log("Get Patent Info Success at " + new Date())
      
      console.log("Get Patent Emergenct at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                    NOK.NOK_Name "Firstname", 
                    NOK.NOK_Name2 "Lastname",
                    NOK.NOK_Relation_DR "Relation",
                    NOK.NOK_Email "Email",
                    CASE
                        WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                        ELSE NOK.NOK_TelH
                    END "PhoneNo",
                    CASE 
                         WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                           AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                           OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                         ELSE NOK_Country_DR->CTCOU_RowId
                      END "Country",
                    NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                    NOK.NOK_CityArea_DR "Subdistrict",
                    NOK.NOK_CityCode_DR "District",
                    NOK.NOK_StNameLine1 "Address",
                    NOK.NOK_Province_DR "Province",
                    '0' "sameAddress"FROM PA_Nok Nok
                    Where NOK_PAPMI_ParRef->PAPMI_ID = '${nation_id}'
                    AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                    AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr > 15
                    ORDER BY NOK_PAPMI_ParRef Desc `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `REPLACE INTO Screening.Patient_Emergency SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
      });
      let query_3 = `UPDATE Screening.Patient_Emergency pe
      SET pe.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
      (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pe.Subdistrict limit 1) AND ca1.Zip_Code = pe.Postcode limit 1)
      WHERE pe.HN = (SELECT HN FROM Screening.Patient_Info WHERE NationalID = '${nation_id}' limit 1) `
        repos.query(query_3, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      console.log("Get Patent Emergenct Success at " + new Date())
      
      console.log("Get Patent Parent at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                    NOK.NOK_Name "Firstname", 
                    NOK.NOK_Name2 "Lastname",
                    NOK.NOK_Relation_DR "Relation",
                    NOK.NOK_Email "Email",
                    CASE
                        WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                        ELSE NOK.NOK_TelH
                    END "PhoneNo",
                    CASE 
                         WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                           AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                          OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                           OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                         ELSE NOK_Country_DR->CTCOU_RowId
                      END "Country",
                    NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                    NOK.NOK_CityArea_DR "Subdistrict",
                    NOK.NOK_CityCode_DR "District",
                    NOK.NOK_StNameLine1 "Address",
                    NOK.NOK_Province_DR "Province",
                    '0' "sameAddress"FROM PA_Nok Nok
                    Where NOK_PAPMI_ParRef->PAPMI_ID = '${nation_id}' 
                    AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                    AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr <= 15
                    ORDER BY NOK_PAPMI_ParRef Desc `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `REPLACE INTO Screening.Parent SET ? `
      result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      query_3 = `UPDATE Screening.Parent pr
      SET pr.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
      (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pr.Subdistrict limit 1) AND ca1.Zip_Code = pr.Postcode limit 1)
      WHERE pr.HN = (SELECT HN FROM Screening.Patient_Info WHERE NationalID = '${nation_id}' limit 1) `
        repos.query(query_3, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      console.log("Get Patent Parent Success at " + new Date())
      
      console.log("Get Patent Address at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT PAPMI_No "HN",
                    CASE 
                       WHEN PAPER_Country_DR IS NULL 
                       AND ((PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                       OR (PAPER_Zip_DR->CTZIP_Province_DR NOT IN ('77', '78') AND PAPER_Zip_DR->CTZIP_Province_DR IS NOT NULL)
                       OR (PAPER_Zip_DR->CTZIP_CITY_DR NOT IN ('1116', '936') AND PAPER_Zip_DR->CTZIP_CITY_DR IS NOT NULL)) THEN 2
                       ELSE PAPER_Country_DR
                      END "Country",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_Code
                      END "Postcode",
                        CASE
                       WHEN PAPER_Zip_DR->CTZIP_Province_DR IN ('77', '78') THEN null
                       ELSE PAPER_Zip_DR->CTZIP_Province_DR
                      END "Province",
                      CASE
                       WHEN PAPER_Zip_DR->CTZIP_CITY_DR IN ('1116', '936') THEN null
                       ELSE  PAPER_Zip_DR->CTZIP_CITY_DR
                      END "District",
                      PAPER_CityArea_DR "Subdistrict",
                      PAPER_StName "Address",
                            '0' "Type"
                      FROM PA_PatMas
                        INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                        WHERE PAPMI_ID = '${nation_id}'
                    `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      let query_del

      // result.map((d: any) => {
      //   query_del = `DELETE FROM Screening.Patient_Address WHERE HN = '${d.HN}' AND Type = '${d.Type}' AND Type = 0 `
      //   repos.query(query_del,function(err:any, results:any) {
      //     if (err) {
      //       return console.error(err.message);
      //     } 
      //   });
      // });
      query_1 = `INSERT INTO Screening.Patient_Address SET ? `
      result.map((d: any) => {
        console.log(999)
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      });

      
      let query_2 = `UPDATE Screening.Patient_Address pa
      SET pa.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
      (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pa.Subdistrict limit 1) AND ca1.Zip_Code = pa.Postcode limit 1)
      WHERE pa.HN = (SELECT HN FROM Screening.Patient_Info WHERE NationalID = '${nation_id}' limit 1) `
        repos.query(query_2, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
        
      console.log("Get Patent Parent Success at " + new Date())
      
      console.log("Get Patent Family at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT  FAM_PAPMI_ParRef->PAPMI_No "HN", 
                    FAM_Relation_DR "Person",
                    FAM_Desc "Disease"
                    FROM PA_Family
                    WHERE FAM_PAPMI_ParRef->PAPMI_ID = '${nation_id}' `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `INSERT INTO Screening.Family_History SET ? `
      await result.map((d: any) => {
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      query_2 = `UPDATE Screening.Family_History fh
      SET Disease = (SELECT ID FROM Registration.CT_Diseases WHERE DescEN = fh.Disease OR DescTH = fh.Disease limit 1)
     WHERE fh.HN = (SELECT HN FROM Screening.Patient_Info WHERE NationalID = '${nation_id}' limit 1) `
        repos.query(query_2, function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      console.log("Get Patent Family Success at " + new Date())
      
      console.log("Get Patent Social at " + new Date())
      repos = di.get("cache");
      result = await new Promise((resolve, reject) => {
        repos.reserve((err: any, connObj: any) => {
          if (connObj) {
            let conn = connObj.conn;
            
            conn.createStatement((err: any, statement: any) => {
              if (err) {
                reject(err);
              } else {
                statement.setFetchSize(100, function (err: any) {
                  if (err) {
                    reject(err);
                  } else {
                    const query = `SELECT SCH_PAPMI_ParRef->PAPMI_No "HN", 
                    LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                    CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                      ELSE SCH_HabitsQty_DR->QTY_desc
                    END"Quantity", 
                    SCH_Desc "Comment",
                    CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                      ELSE 1
                    END "Status",
                    CASE
                      WHEN SCH_DuratDays is not null THEN SCH_DuratDays
                      WHEN SCH_DuratMonth is not null THEN SCH_DuratMonth
                      WHEN SCH_DuratYear is not null THEN SCH_DuratYear
                      ELSE NULL
                    END "DurationQuantity",
                    CASE
                      WHEN SCH_DuratDays is not null THEN 'Days'
                      WHEN SCH_DuratMonth is not null THEN 'Weeks'
                      WHEN SCH_DuratYear is not null THEN 'Years'
                      ELSE NULL
                    END "DurationUnit"
                    FROM PA_SocHist 
                    WHERE SCH_PAPMI_ParRef->PAPMI_ID = '${nation_id}' `;           
                    statement.executeQuery(query, function (
                      err: any,
                      resultset: any
                    ) {
                      if (err) {
                        reject(err);
                      } else {
                        resultset.toObjArray(function (
                          err: any,
                          results: any
                        ) {
                          resolve(results);
                        });
                      }
                    });
                  }
                });
              }
            });
            repos.release(connObj, function (err: any) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      repos = di.get("repos")
      query_1 = `INSERT INTO Screening.Patient_Social SET ? `
      await result.map((d: any) => {
        console.log(d)
        query_del = `DELETE FROM Screening.Patient_Social WHERE HN = '${d.HN}' AND Habit = '${d.Habit}' `
        repos.query(query_del,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })
      await result.map((d: any) => {
        console.log(d)
        repos.query(query_1, d,function(err:any, results:any) {
          if (err) {
            return console.error(err.message);
          }
        });
      })

      console.log("Get Patent Social Success at " + new Date())
      console.log("Finished Get Screening Data at " + new Date())
      
  }
  async postScreeningByData(firstname: any, lastname: any, dateOfBirth: any) {
    console.log("Get Patent Info at " + new Date())
    let repos = di.get("cache");
    let result: any = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT	PAPMI_No "HN",
                PAPMI_Title_DR->TTL_RowId "Title",
                PAPMI_Name "Firstname",
                PAPMI_Name2 "Lastname",
                PAPMI_Name5 "FirstnameEn",
                PAPMI_Name7 "LastnameEn",
                tochar(PAPER_Dob, 'YYYY-MM-DD') "DOB",
                PAPMI_Sex_DR "Gender",
                PAPER_Nation_DR "Nationality",
                PAPER_Religion_DR "Religion",
              PAPER_PrefLanguage_DR "PreferredLanguage",
                PAPMI_Email "Email",
                PAPER_ID "NationalID",
                PAPER_PassportNumber "Passport",
                SUBSTRING(PAPER_Marital_DR->CTMAR_Desc, CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc)+1, (LENGTH(PAPER_Marital_DR->CTMAR_Desc)-CHARINDEX('(', PAPER_Marital_DR->CTMAR_Desc))-1) "MaritalStatus",
                PAPER_SocialStatus_DR->SS_Desc "Occupation",
                PAPER_MobPhone "PhoneNo",
                PAPER_TelH "Homephone" ,
          CASE
                WHEN PAPMI_Title_DR LIKE '%e%' THEN 'en'
                ELSE 'th'
          END "DefaultLanguage",
          CASE
              WHEN PAPER_AgeYr > 15 THEN 0
               ELSE 1
          END "type"
            FROM PA_PatMas
            LEFT JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
            WHERE PAPMI_No IS NOT NULL AND PAPMI_Name = '${firstname}' AND PAPMI_Name2 = '${lastname}' AND PAPMI_DOB = '${dateOfBirth}' `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  let query_1 = `REPLACE INTO Screening.Patient_Info SET ? `
  
  await result.map((d: any) => {
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
    
    let query_2 = `REPLACE INTO Screening.Patient_Financial (HN) VALUES ('${d.HN}') `
    repos.query(query_2, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    }); 
    let query_3 = `REPLACE INTO Screening.Patient_History (HN) VALUES ('${d.HN}') `
    repos.query(query_3, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    }); 
  })
  console.log("Update Financial at " + new Date())
  let query = `UPDATE Screening.Patient_Financial pf1 
  INNER JOIN Screening.Patient_Info pi1 ON pf1.HN = pi1.HN
  INNER JOIN Registration.Patient_Info pi2 ON pi1.Firstname = pi2.Firstname AND pi1.Lastname = pi2.Lastname AND pi1.DOB = pi2.DOB
  INNER JOIN Registration.Patient_Financial pf2 ON pf2.PatientID = pi2.ID 
  SET pf1.SelfPay = pf2.SelfPay,
      pf1.CompanyContact = pf2.CompanyContact,
      pf1.Insurance = pf2.Insurance,
      pf1.CompanyDesc = pf2.CompanyDesc,
      pf1.InsuranceDesc = pf2.InsuranceDesc,
      pf1.PaymentAs = pf2.PaymentAs,
      pf1.Title = pf2.Title,
      pf1.Firstname = pf2.Firstname,
      pf1.Lastname = pf2.Lastname,
      pf1.DOB = pf2.DOB,
      pf1.Aforemention = pf2.Aforemention
  WHERE  pi1.Firstname = '${firstname}' AND  pi1.Lastname = '${lastname}' AND pi1.DOB = '${dateOfBirth}' `
  await  repos.query(query)
  
  console.log("Update History at " + new Date())
  query = `UPDATE Screening.Patient_History ph1 
  INNER JOIN Screening.Patient_Info pi1 ON ph1.HN = pi1.HN
  INNER JOIN Registration.Patient_Info pi2 ON pi1.Firstname = pi2.Firstname AND pi1.Lastname = pi2.Lastname AND pi1.DOB = pi2.DOB
  INNER JOIN Registration.Patient_History ph2 ON ph2.PatientID = pi2.ID 
  SET ph1.MaritalStatus = ph2.MaritalStatus,
      ph1.Children = ph2.Children,
      ph1.Diseases = ph2.Diseases,
      ph1.Medication = ph2.Medication,
      ph1.CommentMedication = ph2.CommentMedication,
      ph1.Hospitalization = ph2.Hospitalization,
      ph1.CommentHospitalization = ph2.CommentHospitalization,
      ph1.Physical = ph2.Physical,
      ph1.CommentPhysical = ph2.CommentPhysical,
      ph1.Exercise = ph2.Exercise,
      ph1.Pregnant = ph2.Pregnant,
      ph1.CommentPregnant = ph2.CommentPregnant,
      ph1.Giver = ph2.Giver,
      ph1.CommentGiver = ph2.CommentGiver,
      ph1.AbsenceFromWork = ph2.AbsenceFromWork,
      ph1.Reimbursement = ph2.Reimbursement,
      ph1.GovernmentReimbursement = ph2.GovernmentReimbursement,
      ph1.StateEnterprise = ph2.StateEnterprise,
      ph1.Authorize = ph2.Authorize,
      ph1.CommentAuthorize = ph2.CommentAuthorize,
      ph1.Spiritual = ph2.Spiritual,
      ph1.CommentSpiritual = ph2.CommentSpiritual,
      ph1.Allergies = ph2.Allergies,
      ph1.CommentAllergies = ph2.CommentAllergies,
      ph1.Alcohol = ph2.Alcohol,
      ph1.DrugAbuse = ph2.DrugAbuse,
      ph1.Smoke = ph2.Smoke,
      ph1.FatherAlive = ph2.FatherAlive,
      ph1.FatherAge = ph2.FatherAge,
      ph1.CauseFather = ph2.CauseFather,
      ph1.MotherAlive = ph2.MotherAlive,
      ph1.MotherAge = ph2.MotherAge,
      ph1.CauseMother = ph2.CauseMother 
  WHERE pi1.Firstname = '${firstname}' AND  pi1.Lastname = '${lastname}' AND pi1.DOB = '${dateOfBirth}'  `
  await  repos.query(query)
  
  
  console.log("Get Patent Info Success at " + new Date())
  
  console.log("Get Patent Emergenct at " + new Date())
  repos = di.get("cache");
  result = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                NOK.NOK_Name "Firstname", 
                NOK.NOK_Name2 "Lastname",
                NOK.NOK_Relation_DR "Relation",
                NOK.NOK_Email "Email",
                CASE
                    WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                    ELSE NOK.NOK_TelH
                END "PhoneNo",
                CASE 
                     WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                       AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                      OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                       OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                     ELSE NOK_Country_DR->CTCOU_RowId
                  END "Country",
                NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                NOK.NOK_CityArea_DR "Subdistrict",
                NOK.NOK_CityCode_DR "District",
                NOK.NOK_StNameLine1 "Address",
                NOK.NOK_Province_DR "Province",
                '0' "sameAddress"FROM PA_Nok Nok
                Where NOK_PAPMI_ParRef->PAPMI_Name = '${firstname}' AND NOK_PAPMI_ParRef->PAPMI_Name2 = '${lastname}' AND NOK_PAPMI_ParRef->PAPMI_DOB = '${dateOfBirth}' 
                AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr > 15 THEN
                ORDER BY NOK_PAPMI_ParRef Desc `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  query_1 = `REPLACE INTO Screening.Patient_Emergency SET ? `
  result.map((d: any) => {
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
    
  });
  let query_3 = `UPDATE Screening.Patient_Emergency pe
  SET pe.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
  (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pe.Subdistrict limit 1) AND ca1.Zip_Code = pe.Postcode limit 1)
  WHERE pe.HN = (SELECT HN FROM Screening.Patient_Info WHERE Firstname = '${firstname}' AND  Lastname = '${lastname}' AND DOB = '${dateOfBirth}' limit 1) `
    repos.query(query_3, function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  console.log("Get Patent Emergenct Success at " + new Date())
  
  console.log("Get Patent Parent at " + new Date())
  repos = di.get("cache");
  result = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT	NOK_PAPMI_ParRef->PAPMI_No "HN",
                NOK.NOK_Name "Firstname", 
                NOK.NOK_Name2 "Lastname",
                NOK.NOK_Relation_DR "Relation",
                NOK.NOK_Email "Email",
                CASE
                    WHEN NOK.NOK_MobPhone IS NOT NULL THEN Nok_TelH
                    ELSE NOK.NOK_TelH
                END "PhoneNo",
                CASE 
                     WHEN Nok.NOK_Country_DR->CTCOU_RowId IS NULL 
                       AND ((Nok.NOK_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                      OR (NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_Zip_DR->CTZIP_Province_DR->PROV_RowId NOT IN ('77', '78') AND NOK_Zip_DR->CTZIP_Province_DR->PROV_RowId IS NOT NULL)
                       OR (NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId NOT IN ('1116', '936') AND NOK_Zip_DR->CTZIP_CITY_DR->CTCIT_RowId IS NOT NULL)) THEN 2
                     ELSE NOK_Country_DR->CTCOU_RowId
                  END "Country",
                NOK.NOK_Zip_DR->CTZIP_Code "Postcode",
                NOK.NOK_CityArea_DR "Subdistrict",
                NOK.NOK_CityCode_DR "District",
                NOK.NOK_StNameLine1 "Address",
                NOK.NOK_Province_DR "Province",
                '0' "sameAddress"FROM PA_Nok Nok
                Where NOK_PAPMI_ParRef->PAPMI_Name = '${firstname}' AND NOK_PAPMI_ParRef->PAPMI_Name2 = '${lastname}' AND NOK_PAPMI_ParRef->PAPMI_DOB = '${dateOfBirth}'
                AND Nok.NOK_Name is not null AND Nok.NOK_Name2 is not null 
                AND NOK_PAPMI_ParRef->PAPMI_RowId->PAPER_AgeYr <= 15
                ORDER BY NOK_PAPMI_ParRef Desc `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  query_1 = `REPLACE INTO Screening.Parent SET ? `
  result.map((d: any) => {
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  })
  query_3 = `UPDATE Screening.Parent pr
  SET pr.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
  (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pr.Subdistrict limit 1) AND ca1.Zip_Code = pr.Postcode limit 1)
  WHERE pr.HN = (SELECT HN FROM Screening.Patient_Info WHERE Firstname = '${firstname}' AND  Lastname = '${lastname}' AND DOB = '${dateOfBirth}' limit 1) `
    repos.query(query_3, function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  console.log("Get Patent Parent Success at " + new Date())
  
  console.log("Get Patent Address at " + new Date())
  repos = di.get("cache");
  result = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT PAPMI_No "HN",
                CASE 
                   WHEN PAPER_Country_DR IS NULL 
                   AND ((PAPER_Zip_DR->CTZIP_Code NOT IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') AND PAPER_Zip_DR->CTZIP_Code IS NOT NULL) 
                   OR (PAPER_Zip_DR->CTZIP_Province_DR NOT IN ('77', '78') AND PAPER_Zip_DR->CTZIP_Province_DR IS NOT NULL)
                   OR (PAPER_Zip_DR->CTZIP_CITY_DR NOT IN ('1116', '936') AND PAPER_Zip_DR->CTZIP_CITY_DR IS NOT NULL)) THEN 2
                   ELSE PAPER_Country_DR
                  END "Country",
                  CASE
                   WHEN PAPER_Zip_DR->CTZIP_Code IN ('900001', '12500', '40001', '74111', '80516', 'JAN-64', 'AUG-43', '11-JAN', '8-JAN', '7-FEB', '900000', '999999') THEN null
                   ELSE  PAPER_Zip_DR->CTZIP_Code
                  END "Postcode",
                    CASE
                   WHEN PAPER_Zip_DR->CTZIP_Province_DR IN ('77', '78') THEN null
                   ELSE PAPER_Zip_DR->CTZIP_Province_DR
                  END "Province",
                  CASE
                   WHEN PAPER_Zip_DR->CTZIP_CITY_DR IN ('1116', '936') THEN null
                   ELSE  PAPER_Zip_DR->CTZIP_CITY_DR
                  END "District",
                  PAPER_CityArea_DR "Subdistrict",
                  PAPER_StName "Address",
                        '0' "Type"
                  FROM PA_PatMas
                    INNER JOIN PA_Person ON PA_PatMas.PAPMI_PAPER_DR = PA_Person.PAPER_RowId
                    WHERE PAPMI_Name = '${firstname}' AND PAPMI_Name2 = '${lastname}' AND PAPMI_DOB = '${dateOfBirth}'
                `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  let query_del

  // result.map((d: any) => {
  //   query_del = `DELETE FROM Screening.Patient_Address WHERE HN = '${d.HN}' AND Type = '${d.Type}' AND Type = 0 `
  //   repos.query(query_del,function(err:any, results:any) {
  //     if (err) {
  //       return console.error(err.message);
  //     } 
  //   });
  // });
  query_1 = `INSERT INTO Screening.Patient_Address SET ? `
  result.map((d: any) => {
    console.log(999)
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  });

  
  let query_2 = `UPDATE Screening.Patient_Address pa
  SET pa.Subdistrict = (SELECT ca1.ID FROM Registration.CT_CityArea_1 ca1 WHERE ca1.Desc_TH = 
  (SELECT ca.Desc_TH FROM Registration.CT_CityArea ca WHERE ca.ID = pa.Subdistrict limit 1) AND ca1.Zip_Code = pa.Postcode limit 1)
  WHERE pa.HN = (SELECT HN FROM Screening.Patient_Info WHERE Firstname = '${firstname}' AND  Lastname = '${lastname}' AND DOB = '${dateOfBirth}' limit 1) `
    repos.query(query_2, function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
    
  console.log("Get Patent Parent Success at " + new Date())
  
  console.log("Get Patent Family at " + new Date())
  repos = di.get("cache");
  result = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT  FAM_PAPMI_ParRef->PAPMI_No "HN", 
                FAM_Relation_DR "Person",
                FAM_Desc "Disease"
                FROM PA_Family
                WHERE FAM_PAPMI_ParRef->PAPMI_Name = '${firstname}' AND FAM_PAPMI_ParRef->PAPMI_Name2 = '${lastname}' AND FAM_PAPMI_ParRef->PAPMI_DOB = '${dateOfBirth}' `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  query_1 = `INSERT INTO Screening.Family_History SET ? `
  await result.map((d: any) => {
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  })
  query_2 = `UPDATE Screening.Family_History fh
  SET Disease = (SELECT ID FROM Registration.CT_Diseases WHERE DescEN = fh.Disease OR DescTH = fh.Disease limit 1)
 WHERE fh.HN = (SELECT HN FROM Screening.Patient_Info WHERE Firstname = '${firstname}' AND  Lastname = '${lastname}' AND DOB = '${dateOfBirth}' limit 1) `
    repos.query(query_2, function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  console.log("Get Patent Family Success at " + new Date())
  
  console.log("Get Patent Social at " + new Date())
  repos = di.get("cache");
  result = await new Promise((resolve, reject) => {
    repos.reserve((err: any, connObj: any) => {
      if (connObj) {
        let conn = connObj.conn;
        
        conn.createStatement((err: any, statement: any) => {
          if (err) {
            reject(err);
          } else {
            statement.setFetchSize(100, function (err: any) {
              if (err) {
                reject(err);
              } else {
                const query = `SELECT SCH_PAPMI_ParRef->PAPMI_No "HN", 
                LOWER(REPLACE(SCH_Habits_DR->HAB_Desc,' ','')) "Habit",
                CASE WHEN SCH_HabitsQty_DR->QTY_desc = 'None' THEN NULL
                  ELSE SCH_HabitsQty_DR->QTY_desc
                END"Quantity", 
                SCH_Desc "Comment",
                CASE WHEN SCH_HabitsQty_DR->QTY_desc IS NOT NULL AND SCH_HabitsQty_DR->QTY_desc = 'None' THEN 0
                  ELSE 1
                END "Status",
                CASE
                  WHEN SCH_DuratDays is not null THEN SCH_DuratDays
                  WHEN SCH_DuratMonth is not null THEN SCH_DuratMonth
                  WHEN SCH_DuratYear is not null THEN SCH_DuratYear
                  ELSE NULL
                END "DurationQuantity",
                CASE
                  WHEN SCH_DuratDays is not null THEN 'Days'
                  WHEN SCH_DuratMonth is not null THEN 'Weeks'
                  WHEN SCH_DuratYear is not null THEN 'Years'
                  ELSE NULL
                END "DurationUnit"
                FROM PA_SocHist 
                WHERE SCH_PAPMI_ParRef->PAPMI_Name = '${firstname}' AND SCH_PAPMI_ParRef->PAPMI_Name2 = '${lastname}' AND SCH_PAPMI_ParRef->PAPMI_DOB = '${dateOfBirth}' `;           
                statement.executeQuery(query, function (
                  err: any,
                  resultset: any
                ) {
                  if (err) {
                    reject(err);
                  } else {
                    resultset.toObjArray(function (
                      err: any,
                      results: any
                    ) {
                      resolve(results);
                    });
                  }
                });
              }
            });
          }
        });
        repos.release(connObj, function (err: any) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
  repos = di.get("repos")
  query_1 = `INSERT INTO Screening.Patient_Social SET ? `
  await result.map((d: any) => {
    console.log(d)
    query_del = `DELETE FROM Screening.Patient_Social WHERE HN = '${d.HN}' AND Habit = '${d.Habit}' `
    repos.query(query_del,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  })
  await result.map((d: any) => {
    console.log(d)
    repos.query(query_1, d,function(err:any, results:any) {
      if (err) {
        return console.error(err.message);
      }
    });
  })

  console.log("Get Patent Social Success at " + new Date())
  console.log("Finished Get Screening Data at " + new Date())
  
}
  saveSignature() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, HN, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Screening.Patient_Info SET Confirm=1 WHERE HN='${HN}';`
      let insertSignature = `INSERT INTO Screening.Signature (HN, HashSiganture, Signature, SignType, Consent) VALUES('${HN}', '${signatureHash}', '${signatureImage}', '${signType}', "${consentText}");`
      await repos.query(query)
      await repos.query(insertSignature)
      res.send({message: 'Success'})
    }
  }
  
  saveSignatureApprove() {
    return async (req: Request, res: Response) => {
      let { signatureHash, signatureImage, HN, signType,consent, consentText } = req.body;
      let repos = di.get("repos");
      let query = `UPDATE Screening.Patient_Info SET Approve=1 WHERE HN='${HN}';`
      let insertSignature = `INSERT INTO Screening.Signature (HN, HashSiganture, Signature, SignType, Consent) VALUES('${HN}', '${signatureHash}', '${signatureImage}', '${signType}', "${consentText}");`
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
          query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`
          
          let queryCount = `SELECT COUNT(PI.HN) as count FROM Screening.Patient_Info PI`
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
          
          if (data.length == 0)
          {
            if (!_.isEmpty(national_id))
            {
              await this.postScreeningByNationID(national_id)
              data = await repos.query(query)
              count = await repos.query(queryCount)
            }else if (!_.isEmpty(firstname) && !_.isEmpty(lastname) && !_.isEmpty(dateOfBirth))
            {
              await this.postScreeningByData(firstname,lastname,dateOfBirth)
              data = await repos.query(query)
              count = await repos.query(queryCount)
            }
            
          }

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
      if (body.type == 0) {
        await this.updateAdult(body)
        res.send({message: 'Success'})
      } else {
        await this.updateChild(body)
        res.send({message: 'Success'})
      }
    }
  }
  
  async updateAdult(body: any) {
    let repos = di.get("repos");
    let getComment = (type: string, data: any) => {
      if (type == 'alcohol') {
        // return `quantity: ${data.quantity}, duration: ${data.detail.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
        return `quantity: "Whisky 1 shot/Beer 1 can/Whisky 180 ml/day", duration: "1 Weeks", beverages: ${data.detail.beverages}, comment: ${data.comment}`
      } else if (type == 'exercise') {
        return `quantity: ${data.quantity}, comment: ${data.comment}`
      } else if (type == 'smoke') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
      }
    }
    let dateDob = new Date(body.patient_info.dob)
    dateDob.setHours(dateDob.getHours() + 7 );
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
      DefaultLanguage: body.defaultlanguage
    }
    let queryInfo = `UPDATE Screening.Patient_Info SET ? WHERE HN = '${body.HN}'`
    
    let dataPresent = {
      Country: body.present.country,
      Postcode: body.present.postcode,
      Subdistrict: body.present.subdistrict,
      District: body.present.districtid,
      Address: body.present.address,
      Province: body.present.provinceid,
      sameAddress: null
    }
    let queryPresent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 0`
    
    let dataPermanent = {
      Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
      Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
      Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
      District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
      Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
      Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
      sameAddress: body.permanent.sameAddress
    }
    let queryPermanent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 1`

    let dataEmergency = {
      Firstname: body.emergency.first_name,
      Lastname: body.emergency.last_name,
      Relation: body.emergency.relation,
      Email: body.emergency.email,
      PhoneNo: body.emergency.phone_no,
      Country: body.emergency.sameAddress ? body.present.country : body.emergency.country,
      Postcode: body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
      Subdistrict: body.emergency.sameAddress ? body.present.subdistrict : body.emergency.subdistrict,
      District: body.emergency.sameAddress ? body.present.districtid : body.emergency.districtid,
      Address: body.emergency.sameAddress ? body.present.address : body.emergency.address,
      Province: body.emergency.sameAddress ? body.present.provinceid : body.emergency.provinceid,
      sameAddress: body.emergency.sameAddress
    }
    let queryEmergency = `UPDATE Screening.Patient_Emergency SET ? WHERE HN = '${body.HN}'`

    let financialDob = new Date(body.financial.dob)
    financialDob.setHours(financialDob.getHours() + 7 );
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
    let queryFinancial = `UPDATE Screening.Patient_Financial SET ? WHERE HN = '${body.HN}'`
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
    let queryHistory = `UPDATE Screening.Patient_History SET ? Where HN = '${body.HN}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryEmergency, dataEmergency)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryHistory, dataHistory);

    let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
      await repos.query(deleteFamily);
    if (body.personal_history.family.length > 0) {
      
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
        DurationQuantity:body.personal_history.alcohol.duration.quantity,
        DurationUnit:body.personal_history.alcohol.duration.unit,
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
        DurationQuantity:body.personal_history.smoke.duration.quantity,
        DurationUnit:body.personal_history.smoke.duration.unit,
        Detail: JSON.stringify(body.personal_history.smoke.detail),
        Comment: body.personal_history.smoke.comment
      }
      let insertSmoke = `INSERT INTO Screening.Patient_Social SET ?`
      await repos.query(insertSmoke, dataSmoke)
    }
    this.handleConsent(body.consent_form, body.HN)
    
    return
    
  }
  async updateChild(body: any) {
    let repos = di.get("repos");
    let dateDob = new Date(body.general_info.dob)
    dateDob.setHours(dateDob.getHours() + 7 );
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
      Site: body.site,
      Religion: body.general_info.religion,
      PreferredLanguage: body.general_info.preferredlanguage,
      DefaultLanguage: body.defaultlanguage
    }
    let queryInfo = `UPDATE Screening.Screening SET ? WHERE HN = '${body.HN}'`
    
    let dataPresent = {
      Country: body.present.country,
      Postcode: body.present.postcode,
      Subdistrict: body.present.subdistrict,
      District: body.present.districtid,
      Address: body.present.address,
      Province: body.present.provinceid,
      sameAddress: null
    }
    let queryPresent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 0`

    let dataPermanent = {
      Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
      Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
      Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
      District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
      Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
      Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
      sameAddress: body.permanent.sameAddress
    }
    let queryPermanent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 1`
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
    let queryFinancial = `UPDATE Screening.Patient_Financial SET ? WHERE HN = '${body.HN}'`
    let queryPediatric = `UPDATE Screening.Pediatric SET ? WHERE HN = '${body.HN}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryPediatric, dataPediatric);
    let valuesParent:  any[] = [] 
    await body.parent_info.parent.map((d: any) => {
      let parentdata = [
        body.HN,
        d.title,
        d.firstname,
        d.middlename,
        d.lastname,
        d.relation,
        d.phoneno,
        d.email,
        d.contactemergency,
        d.livewithperson,
        d.sameAddress ? body.present.country : d.country,
        d.sameAddress ? body.present.postcode : d.postcode,
        d.sameAddress ? body.present.subdistrict : d.subdistrict,
        d.sameAddress ? body.present.districtid : d.districtid,
        d.sameAddress ? body.present.address : d.address,
        d.sameAddress ? body.present.provinceid : d.provinceid,
        d.sameAddress
      ]
      valuesParent.push(parentdata) 
    })
    let deleteParent = `DELETE FROM Screening.Parent WHERE HN = '${body.HN}'`
    await repos.query(deleteParent);
    let queryParent = `INSERT INTO Screening.Parent (HN, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
    await repos.query(queryParent, [valuesParent]);
    
    let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
      await repos.query(deleteFamily);
      
    if (body.siblings.family.length > 0) {
      
      let valuesFamily: any[] = [] 
      body.siblings.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.HN, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Screening.Family_History (HN, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    this.handleConsent(body.consent_form, body.HN)
    
    return
  }
  
  async handleConsent(data: any, hn: any) {
    let repos = di.get("repos")
    let query_1 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '1', '${data.consent_1.text}', ${data.consent_1.status})`
    let query_2_1 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_1', '${data.consent_2_1.text}', ${data.consent_2_1.status})`
    let query_2_2 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_2', '${data.consent_2_2.text}', ${data.consent_2_2.status})`
    let query_2_3 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_3', '${data.consent_2_3.text}', ${data.consent_2_3.status})`
    let query_2_4 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_4', '${data.consent_2_4.text}', ${data.consent_2_4.status})`
    let query_2_5_1 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_5_1', '${data.consent_2_5_1.text}', ${data.consent_2_5_1.status})`
    let query_2_5_2 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_5_2', '${data.consent_2_5_2.text}', ${data.consent_2_5_2.status})`
    let query_2_5_3 = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, '2_5_3', '${data.consent_2_5_3.text}', ${data.consent_2_5_3.status})`
    await repos.query(query_1)
    await repos.query(query_2_1)
    await repos.query(query_2_2)
    await repos.query(query_2_3)
    await repos.query(query_2_4)
    await repos.query(query_2_5_1)
    await repos.query(query_2_5_2)
    await repos.query(query_2_5_3)
    if (data.other.choice_1.status === true) {
      let query = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, 'other_1', '${data.other.choice_1.text}', ${data.other.choice_1.status})`
      repos.query(query)
    }
    if (data.other.choice_2.status === true) {
      let query = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, 'other_2', '${data.other.choice_2.text}', ${data.other.choice_2.status})`
      repos.query(query)
    }
    if (data.other.choice_3.status === true) {
      let query = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, 'other_3', '${data.other.choice_3.text}', ${data.other.choice_3.status})`
      repos.query(query)
    }
    if (data.other.choice_4.status === true) {
      let query = `REPLACE INTO Screening.Consent (HN, Clause, Message, Agree) VALUES(${hn}, 'other_4', '${data.other.choice_4.text}', ${data.other.choice_4.status})`
      repos.query(query)
    }
    return
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
        query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`
          
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
        query += ` ORDER BY ID DESC LIMIT ${startNum},${LimitNum}`
          
        let queryCount = `SELECT COUNT(PI.HN) as count FROM Screening.Patient_Info PI`
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
      if (body.type == 0) {
        await this.approveAdult(body)
        res.send({message: 'Success'})
      } else {
        await this.approveChild(body)
        res.send({message: 'Success'})
      }
    }
  }
  async approveAdult(body: any) {
    let repos = di.get("repos");
    let getComment = (type: string, data: any) => {
      if (type == 'alcohol') {
        return `quantity: ${data.quantity}, duration: ${data.duration}, beverages: ${data.detail.beverages}, comment: ${data.comment}`
      } else if (type == 'exercise') {
        return `quantity: ${data.quantity}, comment: ${data.comment}`
      } else if (type == 'smoke') {
        return `quantity: ${data.quantity}, duration: ${data.detail.duration}, comment: ${data.comment}`
      }
    }
    let dateDob = new Date(body.patient_info.dob)
    dateDob.setHours(dateDob.getHours() + 7 );
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
      DefaultLanguage: body.defaultlanguage
    }
    let queryInfo = `UPDATE Screening.Patient_Info SET ? WHERE HN = '${body.HN}'`
    
    let dataPresent = {
      Country: body.present.country,
      Postcode: body.present.postcode,
      Subdistrict: body.present.subdistrict,
      District: body.present.districtid,
      Address: body.present.address,
      Province: body.present.provinceid,
      sameAddress: null
    }
    let queryPresent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 0`
    
    let dataPermanent = {
      Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
      Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
      Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
      District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
      Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
      Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
      sameAddress: body.permanent.sameAddress
    }
    let queryPermanent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 1`
    let dataEmergency = {
      Firstname: body.emergency.first_name,
      Lastname: body.emergency.last_name,
      Relation: body.emergency.relation,
      Email: body.emergency.email,
      PhoneNo: body.emergency.phone_no,
      Country: body.emergency.sameAddress ? body.present.country : body.emergency.country,
      Postcode: body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
      Subdistrict: body.emergency.sameAddress ? body.present.subdistrict : body.emergency.subdistrict,
      District: body.emergency.sameAddress ? body.present.districtid : body.emergency.districtid,
      Address: body.emergency.sameAddress ? body.present.address : body.emergency.address,
      Province: body.emergency.sameAddress ? body.present.provinceid : body.emergency.provinceid,
      sameAddress: body.emergency.sameAddress
    }
    let queryEmergency = `UPDATE Screening.Patient_Emergency SET ? WHERE HN = '${body.HN}'`

    let financialDob = new Date(body.financial.dob)
    financialDob.setHours(financialDob.getHours() + 7 );
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
    let queryFinancial = `UPDATE Screening.Patient_Financial SET ? WHERE HN = '${body.HN}'`
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
    let queryHistory = `UPDATE Screening.Patient_History SET ? Where HN = '${body.HN}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryEmergency, dataEmergency)
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
        DurationQuantity:body.personal_history.alcohol.duration.quantity,
        DurationUnit:body.personal_history.alcohol.duration.unit,
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
        Quantity: null,
        DurationQuantity: null,
        DurationUnit: null,
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
        DurationQuantity:body.personal_history.smoke.duration.quantity,
        DurationUnit:body.personal_history.smoke.duration.unit,
        Detail: JSON.stringify(body.personal_history.smoke.detail),
        Comment: body.personal_history.smoke.comment
      }
      let insertSmoke = `INSERT INTO Screening.Patient_Social SET ?`
      await repos.query(insertSmoke, dataSmoke)
    }
    this.handleConsent(body.consent_form, body.HN)
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
      return subdistrict[0].Desc_TC
    }
    let District = async (id: any) => {
      let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
      let district = await repos.query(queryDistrict)
      if (!district.length) return ''
      return district[0].Desc_TC
    }
    let Province = async (id: any) => {
      let queryProvince = `SELECT * FROM Registration.CT_Province_1 WHERE ID = ${id}`
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
    let FamilyRelation = async (id: any) => {
      let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
      let relation = await repos.query(queryRelation)
      if (!relation.length) return null
      return relation[0].Desc
    }
    let FamilyDisease = async (id: any) => {
      let queryRelation = `SELECT * FROM Registration.CT_Diseases Where ID = ${id}`
      let disease = await repos.query(queryRelation)
      if (!disease.length) return null
      return body.defaultlanguage == 'th'? disease[0].DescTH : disease[0].DescEN
    }
    let Nation = await repos.query(queryNation)
    let Religion = await repos.query(queryReligion)
    let Gender = await repos.query(queryGender)
    
    let family = await Promise.all(body.personal_history.family.map(async (item: any): Promise<any> => {

      //let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
      //let relation = await repos.query(queryRelation)
      return {
        "id_patient_family": null,
        "id_patient_information": null,
        "relation": await FamilyRelation(item.person),
        "disease": null,
        "start": 0,
        "end": 0,
        "comment": await FamilyDisease(item.illness)
      }
    }));
    let social: any = new Array()
    let dataalcohol = await {
      id_patient_social: null,
      id_patient_information: null,
      habit: "Alcohol",
      quality: body.personal_history.alcohol.status ? body.personal_history.alcohol.quantity : "None",
      duration: body.personal_history.alcohol.duration.quantity ? body.personal_history.alcohol.duration.quantity + "-" 
      + body.personal_history.alcohol.duration.unit : null,
      //detail: null,
      comment: body.personal_history.alcohol.comment
      //comment: await getComment('alcohol', body.personal_history.alcohol)
    }
    let dataexercise = await {
      id_patient_social: null,
      id_patient_information: null,
      habit: "Exercise",
      quality : body.personal_history.exercise.status ? body.personal_history.exercise.quantity : "None",
      duration: null,
      //detail: null,
      comment: body.personal_history.exercise.comment
      //comment: await getComment('exercise', body.personal_history.exercise)
    }
    let datasmoke = await {
      id_patient_social: null,
      id_patient_information: null,
      habit:"Smoking",
      quality: body.personal_history.smoke.status ? body.personal_history.smoke.quantity : "None",
      duration: body.personal_history.smoke.duration.quantity ? body.personal_history.smoke.duration.quantity + "-" 
      + body.personal_history.smoke.duration.unit : null,
      //detail: null,
      comment: body.personal_history.smoke.comment
      // quality: null,
      // detail: null,
      // comment: await getComment('smoke', body.personal_history.smoke)
    }
    
    let datadrugabuse = await {
      id_patient_social: null,
      id_patient_information: null,
      habit:"Drug abuse",
      quality: body.personal_history.drugabuse.status ? "Current" : "None",
      duration: null,
      //detail: null,
      comment: body.personal_history.drugabuse.comment
      // quality: null,
      // detail: null,
      // comment: await getComment('smoke', body.personal_history.smoke)
    }
    
    await social.push(dataalcohol)
    await social.push(dataexercise)
    await social.push(datasmoke)
    await social.push(datadrugabuse)
    // if (body.personal_history.alcohol.status) await social.push(dataalcohol)
    // if (body.personal_history.exercise.status) await social.push(dataexercise)
    // if (body.personal_history.smoke.status) await social.push(datasmoke) 
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
        "firstname_th": body.patient_info.firstname.toUpperCase(),
        "middlename_th": body.patient_info.middlename,
        "lastname_th": body.patient_info.lastname.toUpperCase(),
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
        "mobile_phone": (body.patient_info.phone_no && body.patient_info.phone_no.length == 10) ? body.patient_info.phone_no : ".",
        "email":body.patient_info.email,
        "home_telephone":body.patient_info.phone_no,
        "office_telephone":body.patient_info.officephone,
        "permanent_address": body.present.address,
        "permanent_sub_district": await Subdistrict(body.present.subdistrict),
        "permanent_district": await District(body.present.districtid),
        "permanent_province": await Province(body.present.provinceid),
        "permanent_postcode": body.present.postcode,
        "permanent_country": await Country(body.present.country),
        "same_permanent": body.permanent.sameAddress ? 1 : 0,
        "present_address":body.permanent.sameAddress ? body.present.address : body.permanent.address,
        "present_sub_district":body.permanent.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.permanent.subdistrict),
        "present_district":body.permanent.sameAddress ? await District(body.present.districtid) : await District(body.permanent.districtid),
        "present_province":body.permanent.sameAddress ? await Province(body.present.provinceid) : await Province(body.permanent.provinceid),
        "present_postcode":body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
        "present_country":body.permanent.sameAddress ? await Country(body.present.country) : await Country(body.permanent.country),
        "ec_firstname":body.emergency.first_name.toUpperCase(),
        "ec_lastname":body.emergency.last_name.toUpperCase(),
        "ec_relationship": await Relation(body.emergency.relation),
        "ec_relationship_other": body.emergency.relation,
        "ec_telephone": body.emergency.phone_no,
        "e_home_telephone":body.emergency.phone_no,
        "ec_email":body.emergency.email,
        "ec_address_same_patient": body.emergency.sameAddress ? 1 : 0,
        "ec_address":body.emergency.sameAddress ? body.present.address : body.emergency.address,
        "ec_sub_district":body.emergency.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.emergency.subdistrict),
        "ec_district":body.emergency.sameAddress ? await District(body.present.districtid) : await District(body.emergency.districtid),
        "ec_province":body.emergency.sameAddress ? await Province(body.present.provinceid) : await Province(body.emergency.provinceid),
        "ec_postcode":body.emergency.sameAddress ? body.present.postcode : body.emergency.postcode,
        "ec_country":body.emergency.sameAddress ? await Country(body.present.country) : await Country(body.emergency.country),
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
    dateDob.setHours(dateDob.getHours() + 7 );
    let dataInfo = {
      Title: body.general_info.title,
      Firstname: body.general_info.firstname.toUpperCase(),
      Middlename: body.general_info.middlename,
      Lastname: body.general_info.lastname.toUpperCase(),
      DOB: `${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
      Gender: body.general_info.gender,
      Nationality: body.general_info.nationality,
      PhoneNo: body.general_info.phone_no,
      Email: body.general_info.email,
      Type: body.type,
      Site: body.site,
      PreferredLanguage: body.general_info.preferredlanguage,
      DefaultLanguage: body.defaultlanguage
    }
    let queryInfo = `UPDATE Screening.Patient_Info SET ? WHERE HN = '${body.HN}'`
    
    let dataPresent = {
      Country: body.present.country,
      Postcode: body.present.postcode,
      Subdistrict: body.present.subdistrict,
      District: body.present.districtid,
      Address: body.present.address,
      Province: body.present.provinceid,
      sameAddress: null
    }
    let queryPresent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 0`

    let dataPermanent = {
      Country: body.permanent.sameAddress ? body.present.country : body.permanent.country,
      Postcode: body.permanent.sameAddress ? body.present.postcode : body.permanent.postcode,
      Subdistrict: body.permanent.sameAddress ? body.present.subdistrict : body.permanent.subdistrict,
      District: body.permanent.sameAddress ? body.present.districtid : body.permanent.districtid,
      Address: body.permanent.sameAddress ? body.present.address : body.permanent.address,
      Province: body.permanent.sameAddress ? body.present.provinceid : body.permanent.provinceid,
      sameAddress: body.permanent.sameAddress
    }
    let queryPermanent = `UPDATE Screening.Patient_Address SET ? WHERE HN = '${body.HN}' And Type = 1`
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
    let queryFinancial = `UPDATE Screening.Patient_Financial SET ? WHERE HN = '${body.HN}'`
    let queryPediatric = `UPDATE Screening.Pediatric SET ? WHERE HN = '${body.HN}'`

    await repos.query(queryInfo, dataInfo);
    await repos.query(queryPermanent, dataPermanent)
    await repos.query(queryPresent, dataPresent)
    await repos.query(queryFinancial, dataFinancial);
    await repos.query(queryPediatric, dataPediatric);
    let valuesParent:  any[] = [] 
    await body.parent_info.parent.map((d: any) => {
      let parentdata = [
        body.HN,
        d.title,
        d.firstname.toUpperCase(),
        d.middlename,
        d.lastname.toUpperCase(),
        d.relation,
        d.phoneno,
        d.email,
        d.contactemergency,
        d.livewithperson,
        d.sameAddress ? body.present.country : d.country,
        d.sameAddress ? body.present.postcode : d.postcode,
        d.sameAddress ? body.present.subdistrict : d.subdistrict,
        d.sameAddress ? body.present.districtid : d.districtid,
        d.sameAddress ? body.present.address : d.address,
        d.sameAddress ? body.present.provinceid : d.provinceid,
        d.sameAddress
      ]
      valuesParent.push(parentdata) 
    })
    let deleteParent = `DELETE FROM Screening.Parent WHERE HN = '${body.HN}'`
    await repos.query(deleteParent);
    let queryParent = `INSERT INTO Screening.Parent (HNtID, Title, Firstname, Middlename, Lastname, Relation, PhoneNo, Email, ContactEmergency, LivePerson, Country, Postcode, Subdistrict, District, Address, Province, sameAddress) VALUES ?`
    await repos.query(queryParent, [valuesParent]);
    if (body.siblings.family.length > 0) {
      let deleteFamily = `DELETE FROM Screening.Family_History WHERE HN = '${body.HN}'`
      await repos.query(deleteFamily);
      let valuesFamily: any[] = [] 
      body.siblings.family.map((p: any) => {
        if (p.person != null && p.illness != null) {
          let value = [body.HN, p.person, p.illness]
          valuesFamily.push(value) 
        }
      })
      let insertFamily = `INSERT INTO Screening.Family_History (HN, Person, Disease) VALUES ?;`
      if (valuesFamily.length) await repos.query(insertFamily, [valuesFamily])
    }
    this.handleConsent(body.consent_form, body.HN)
    let queryNation = `SELECT * FROM Registration.CT_Nation Where ID = ${body.general_info.nationality}`
    let queryGender = `SELECT * FROM Registration.CT_Sex Where ID = ${body.general_info.gender}`
    let queryReligion = `SELECT * FROM Registration.CT_Religion Where ID = ${body.general_info.religion}`
    
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
      return subdistrict[0].Desc_TC
    }
    let District = async (id: any) => {
      let queryDistrict = `SELECT * FROM Registration.CT_City_1 WHERE ID = ${id}`
      let district = await repos.query(queryDistrict)
      if (!district.length) return ''
      return district[0].Desc_TC
    }
    let Province = async (id: any) => {
      let queryProvince = `SELECT * FROM Registration.CT_Province_1 WHERE ID = ${id}`
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
    let FamilyRelation = async (id: any) => {
      let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${id}`
      let relation = await repos.query(queryRelation)
      if (!relation.length) return null
      return relation[0].Desc
    }
    let FamilyDisease = async (id: any) => {
      let queryRelation = `SELECT * FROM Registration.CT_Diseases Where ID = ${id}`
      let disease = await repos.query(queryRelation)
      if (!disease.length) return null
      return body.defaultlanguage == 'th'? disease[0].DescTH : disease[0].DescEN
    }
    let Nation = await repos.query(queryNation)
    let Religion = await repos.query(queryReligion)
    let Gender = await repos.query(queryGender)
    
    let family = await Promise.all(body.siblings.family.map(async (item: any): Promise<any> => {

      //let queryRelation = `SELECT * FROM Registration.CT_Relation Where ID = ${item.person}`
      //let relation = await repos.query(queryRelation)
      return {
        "id_patient_family": null,
        "id_patient_information": null,
        "relation": await FamilyRelation(item.person),
        "disease": null,
        "start": 0,
        "end": 0,
        "comment": await FamilyDisease(item.illness)
      }
    }));
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
        "title_th": await Title(body.general_info.title),
        "firstname_th": body.general_info.firstname.toUpperCase(),
        "middlename_th": body.general_info.middlename,
        "lastname_th": body.general_info.lastname.toUpperCase(),
        "title_en":null,
        "firstname_en":null,
        "middlename_en":null,
        "lastname_en":null,
        "nationality": Nation[0].Desc_EN,
        "religion": 4,
        "religion_desc": Religion[0].Desc_TH,
        "religion_desc_en": Religion[0].Desc_EN,
        "national_id": null,
        "passport_id": null,
        //"dob":`${dateDob.getFullYear()}-${("0" + (dateDob.getMonth() + 1)).slice(-2)}-${("0" + dateDob.getDate()).slice(-2)}`,
        "dob": dateDob,
        "age":null,
        "gender": body.general_info.gender,
        "gender_desc_en":Gender[0].Desc_EN,
        "gender_desc_th":Gender[0].Desc_TH,
        "marital_status": null,
        "preferrend_language": await PreferredLanguage(body.general_info.preferredlanguage),
        "occupation": null,
        "mobile_phone": (body.general_info.phone_no && body.general_info.phone_no.length == 10) ? body.general_info.phone_no : ".",
        "email":body.general_info.email,
        "home_telephone": null,
        "office_telephone": null,
        "permanent_address": body.present.address,
        "permanent_sub_district": await Subdistrict(body.present.subdistrict),
        "permanent_district": await District(body.present.districtid),
        "permanent_province": await Province(body.present.provinceid),
        "permanent_postcode": body.present.postcode,
        "permanent_country": await Country(body.present.country),
        "same_permanent": body.permanent.sameAddress ? 1 : 0,
        "present_address":body.permanent.sameAddress ? body.present.address : body.permanent.address,
        "present_sub_district":body.permanent.sameAddress ? await Subdistrict(body.present.subdistrict) : await Subdistrict(body.permanent.subdistrict),
        "present_district":body.permanent.sameAddress ? await District(body.present.districtid) : await District(body.permanent.districtid),
        "present_province":body.permanent.sameAddress ? await Province(body.present.provinceid) : await Province(body.permanent.provinceid),
        "present_postcode":body.permanent.sameAddress ? body.present.postcode : body.present.postcode,
        "present_country":body.permanent.sameAddress ? await Country(body.present.country) : await Country(body.permanent.country),
        "ec_firstname": emergency != undefined ? emergency.firstname : null,
        "ec_lastname": emergency != undefined ? emergency.lastname : null,
        "ec_relationship":await Relation(emergency.relation),
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
    const filename = `${body.HN}+${time.getFullYear()}-${("0" + (time.getMonth() + 1)).slice(-2)}-${time.getDate()}+${time.getTime()}.txt`
    const path = '/Process'
    let sendrpa = await axios.post(`http://10.105.10.50:8700/api/CpoeRegister/registerCpoe`, { path, filename, data: rpa })
    return
  }
  updateScreening() {
    return async (req: Request, res: Response) => {
      let body = req.body
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

router.post("/", route.postScreening())
      .post("/search", route.getSearch())
      .post("/signature", route.saveSignature())
      .post("/update", route.updateData())
      .post("/getPendingData", route.getPendingData())
      .post("/approve", route.approveData())
      .post("/screening", route.updateScreening())
      .post("/signatureApprove", route.saveSignatureApprove())
      .post("/getApprovedData", route.getApprovedData())
      

export const screening = router;