import { LightningElement, wire, track } from 'lwc';
import getCandidate from '@salesforce/apex/candidate.getCandidate';
import getCandidateResult from '@salesforce/apex/candidate.getCandidateResult';
import getAssessDet from '@salesforce/apex/candidate.getAssessDet';

import { NavigationMixin } from 'lightning/navigation';

export default class RetakeCandidate extends NavigationMixin(LightningElement) {

    em;

    name;   
    email;
    date;
    phone; 
    qual;  
    assessName;
    assess;  
    currentDate;

    candId;
    numQues=0;
    numMins=0;

    @track showModal = false;
    closeModal(){
        this.showModal=false;       
    }

emailHandler(event){
    this.em=event.target.value;
    console.log('Email : ',this.em);
}
handleClick(event){
    if(this.em.length>2){
    getCandidate({email: this.em})
    .then(result => {       
        this.candId = result[0].Id;
        this.assess = result[0].Assessment__c;
        this.name = result[0].Candidate_Name__c;
        this.error = undefined;
        alert('Details : '+ this.candId+' - '+this.assess+' - '+this.name );        
    })
    .catch(error => {
        alert('We did not find your details with us!');
        //alert('Hello Error! - '+ this.error);        
    });
  }
}

@wire(getCandidateResult, {cand : '$candId'})
candidateData({data,error}){
    if(data){
    if (!Array.isArray(data) || data.length === 0) {
        alert('We did not find your result with us!');
        console.log('Data1 : ',JSON.stringify(data));
        getAssessDet({assId: this.assess})
            .then(result => {
                this.numQues = result[0].No_of_Questions_to_Answer__c;
                this.numMins = result[0].Time__c;
                this.assessName= result[0].Name;
                this.error = undefined;
                this.showModal=true;
              //  alert('Assess Details : '+ this.assessName+' - '+this.numQues+' - '+this.numMins );
            })
            .catch(error => {                
                alert('Err - '+ error.body.message);
            });  

    } else {
        alert('We found your result with us! We are not taking forword anymore.');  //  Score: ' + data[0].Score__c+'.
        console.log('Data 1: ',JSON.stringify(data));
    }
    }if(error){
        alert('Err1 - '+ error.body.message);
    }
}

StartTest(){    
    this[NavigationMixin.Navigate]({
        type: 'comm__namedPage',
        attributes: {
            name: 'questions__c'
        },
        state: {
                     'candId': this.candId,   
                    'assessId': this.assess,
                    'assessName': this.assessName,
                    'candName': this.name,
                    'numQues':this.numQues,
                    'numMins': this.numMins
                }
    });
}

}