import { LightningElement, wire, track } from "lwc";
import getAssessId from "@salesforce/apex/candidate.getAssessId";
import getAssessDet from "@salesforce/apex/candidate.getAssessDet";
import getCandidateEmail from "@salesforce/apex/candidate.getCandidateEmail";
import getEmailCandidate from "@salesforce/apex/candidate.getEmailCandidate";
import getCandidate from "@salesforce/apex/candidate.getCandidate";

import getCandidateResult from "@salesforce/apex/candidate.getCandidateResult";

import { createRecord } from "lightning/uiRecordApi";
import Cand from "@salesforce/schema/Candidate__c";

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

export default class Candidates extends NavigationMixin(LightningElement) {
  @track qualificationOptions = [
    {
      label: "Secondary education or high school",
      value: "Secondary education or high school"
    },
    { label: "Vocational qualification", value: "Vocational qualification" },
    { label: "Bachelors degree", value: "Bachelors degree" },
    { label: "Masters degree", value: "Masters degree" },
    { label: "Doctorate or higher", value: "Doctorate or higher" }
  ];

  name;
  email;
  em;
  date;
  phone;
  qual;
  assessName;
  assess;
  currentDate;

  RestCandId;
  candId;
  numQues = 0;
  numMins = 0;

  @track showModal = false;
  @track submitButtonDisabled = true;
  @track examattending = false;

  connectedCallback() {
    window.sessionStorage.setItem("somekey", 1);

    let oldurl = window.location.href;
    let newurl = new URL(oldurl).searchParams;
    this.RestCandId = newurl.get("candId");
    //   console.log('RestCandId : ',this.RestCandId);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    this.currentDate = `${year}-${month}-${day}`;
    this.date = this.currentDate;
  }

  @track l_All_Types;
  @track assessOptions;

  @track candidateDetails;

  @wire(getEmailCandidate, { cand: "$RestCandId" })
  ques({ data, error }) {
    if (data) {
      if (!Array.isArray(data) || data.length === 0) {
        this.showToast("ERROR", "Unauthirized Candidate Details.", "error");
      } else {
        this.candidateDetails = data;
        this.assessName = data[0].Assessment__c;
        this.name = data[0].Candidate_Name__c;
        this.email = data[0].Email__c;
        this.em = data[0].Email__c;
        this.phone = data[0].Phone__c;
        this.qual = data[0].Qualification__c;
        this.exp = data[0].Experience__c;
      }
    }
    if (error) {
      this.showToast(
        "ERROR",
        "Error in Fetching Related Candidate Details: " + error,
        "error"
      );
    }
  }

  @wire(getAssessId, { assessN: "$assessName" })
  WiredObjects_Type({ error, data }) {
    if (data) {
      this.assess = data[0].Id;
      this.numQues = data[0].No_of_Questions_to_Answer__c;
      this.numMins = data[0].Time__c;
      // this.showToast('Success','Assessment ID: '+this.assess, 'success');
    } else if (error) {
      this.showToast(
        "ERROR",
        "Error in Fetching Related Assessment ID: " + error,
        "error"
      );
    }
  }

  @wire(getCandidate, { email: "$email" })
  getcan({ data, error }) {
    if (data) {
      if (!Array.isArray(data) || data.length === 0) {
        this.submitButtonDisabled = false;
        // alert('Got access to rigstered as new Candidate! 1');
        getCandidateEmail({ email: this.email })
          .then((res) => {
            this.submitButtonDisabled = false;
            this.el = res[0].Email__c;
            this.showToast(
              "Success",
              "Authorized Candidate: " + this.el,
              "success"
            );
          })
          .catch((err) => {
            this.submitButtonDisabled = true;
            this.showToast(
              "ERROR",
              "We didn`t find your details with us! Please enter correct email." +
                err,
              "error"
            );
          });
      }
      if (!Array.isArray(data) || data.length === 1) {
        this.candId = data[0].Id;
        this.assess = data[0].Assessment__c;
        this.name = data[0].Candidate_Name__c;
        this.error = undefined;
        this.submitButtonDisabled = true;
        //  alert('Details : '+ this.candId+' - '+this.assess+' - '+this.name );
        this.showToast(
          "Warning",
          "You, already registered with us.",
          "warning"
        );
      }
    }
    if (error) {
      this.showToast("ERROR !!", "We Hit some Error : " + error, "error");
    }
  }

  @wire(getCandidateResult, { cand: "$candId" })
  candidateData({ data, error }) {
    if (data) {
      if (!Array.isArray(data) || data.length === 0) {
        if (this.submitButtonDisabled) {
          this.examattending = true;
        }
        this.showToast(
          "Alert!",
          "We did not find your result with us!",
          "success"
        );
        // console.log('Data1 : ',JSON.stringify(data));
        getAssessDet({ assId: this.assess })
          .then((result) => {
            this.numQues = result[0].No_of_Questions_to_Answer__c;
            this.numMins = result[0].Time__c;
            this.assessName = result[0].Name;
            this.error = undefined;
            //  alert('Assess Details : '+ this.assessName+' - '+this.numQues+' - '+this.numMins );
          })
          .catch((erro) => {
            this.showToast(
              "ERROR - !",
              "We hit some Snagh : " + erro.body.message,
              "error"
            );
          });
      } else {
        this.showToast(
          "Warning",
          "We found your result also with us!",
          "warning"
        ); //+ data[0].Score__c
        //  console.log('Data2: ',JSON.stringify(data));
      }
    }
    if (error) {
      this.showToast(
        "ERROR - !!",
        "We hit some Snagh : " + error.body.message,
        "error"
      );
    }
  }

  handleAssess() {
    this.showModal = true;
  }

  handleClick(event) {
    if (
      this.email.length > 3 &&
      this.name.length > 3 &&
      this.phone.length === 10 &&
      this.assess.length > 3 &&
      this.qual.length >= 2 &&
      this.exp.length >= 3
    ) {
      var field = {
        Candidate_Name__c: this.name,
        Email__c: this.email,
        Phone__c: this.phone,
        Assessment__c: this.assess,
        Date__c: this.currentDate,
        Qualification__c: this.qual,
        Experience__c: this.exp
      };

      const can_details = { apiName: Cand.objectApiName, fields: field };

      createRecord(can_details)
        .then((response) => {
          // alert("Candidate is created with ID : "+response.id);
          this.candId = response.id;
          this.submitButtonDisabled = true;
          this.showModal = true;
        })
        .catch((error) => {
          this.showToast("ERROR", error.body.message, "error");
        });
    } else {
      this.showToast(
        "ERROR",
        "Please fill all mandatory fields correctly.!" + this.exp,
        "error"
      );
    }
  }

  closeModal() {
    this.showModal = false;
  }

  showToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(evt);
  }

  StartTest() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Media stream obtained:", stream);
        this[NavigationMixin.Navigate]({
          type: "comm__namedPage",
          attributes: {
            name: "questions__c"
          },
          state: {
            candId: this.candId,
            assessId: this.assess,
            assessName: this.assessName,
            candName: this.name,
            numQues: this.numQues,
            numMins: this.numMins,
            exp: this.exp
          }
        });
      })
      .catch(function (error) {
        if (error == "NotAllowedError: Permission denied") {
          alert("Please, give Audio & Video pemission to start the Assessment");
        }
        console.error("Something went wrong: " + error);
      });
  }
}

// this[NavigationMixin.Navigate]({
//     type: "standard__component",
//     attributes: {
//         componentName: "c__NavigationToQuesHelper"
//     },
//     state: {
//          c__candId: this.candId,
//         c__assessId: this.assess,
//         c__assessName: this.assessName,
//         c__candName: this.name
//     }
// });

// if(this.phone.length!=10){
//     this.showToast('ERROR','Please, fill phone number field with 10 digits!', 'error');
//        // alert('Please, fill phone number field with 10 digits!');
// }
