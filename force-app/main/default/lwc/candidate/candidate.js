import { LightningElement, wire, track } from 'lwc';
import getAssess from '@salesforce/apex/candidate.getAssess';
import getAssessDet from '@salesforce/apex/candidate.getAssessDet';
import getCandidateEmail from '@salesforce/apex/candidate.getCandidateEmail';
import getCandidate from '@salesforce/apex/candidate.getCandidate';
import { createRecord } from 'lightning/uiRecordApi';
import Cand from '@salesforce/schema/Candidate__c';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class Candidate extends NavigationMixin(LightningElement) {

    @track qualificationOptions = [
        { label: 'Secondary education or high school', value: 'Secondary education or high school' },
        { label: 'Vocational qualification', value: 'Vocational qualification' },
        { label: 'Bachelors degree', value: 'Bachelors degree' },
        { label: 'Masters degree', value: 'Masters degree' },
        { label: 'Doctorate or higher', value: 'Doctorate or higher' },
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

    candId;
    numQues=0;
    numMins=0;
    
    @track showModal = false;
    @track submitButtonDisabled = true;


    connectedCallback() {
        window.sessionStorage.setItem('somekey',1);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.currentDate = `${year}-${month}-${day}`;
        this.date=this.currentDate;
    }       

        @track l_All_Types;
        @track assessOptions;
     
        @wire(getAssess, {})
        WiredObjects_Type({ error, data }) {
     
            if (data) {
                try {
                    this.l_All_Types = data; 
                    let options = [];
                     
                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        options.push({ label: data[key].Name, value: data[key].Id  });    
                       
                    }
                    this.assessOptions = options;
                     
                } catch (error) {
                    console.error('Hi===== check error here', error);                    
                }
            } else if (error) {
                console.error('Hi+++++ check error here', error);               
            }
     
        }
     
        handleAssessChange(event){
            this.assess = event.target.value; 
            this.assessName=event.target.options.find(opt => opt.value === event.detail.value).label; 
            
            getAssessDet({assId: this.assess})
            .then(result => {
                this.numQues = result[0].No_of_Questions_to_Answer__c;
                this.numMins = result[0].Time__c;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;                
            });           

        }  
        
        handleQualiChange(event){
            this.qual = event.target.value;             
        }
        emailHandler(event){
            this.email=event.target.value;
            console.log('Email : ',this.email);

            getCandidate({email: this.email})
                    .then(result => {       
                        this.candId = result[0].Id;
                        this.assess = result[0].Assessment__c;
                        this.name = result[0].Candidate_Name__c;
                        this.error = undefined;
                        this.submitButtonDisabled = true;
                      //  alert('Details : '+ this.candId+' - '+this.assess+' - '+this.name ); 
                        this.showToast('Warning','You, already registered with us. Check the next panel.', 'warning');       
                    })
                    .catch(error => {
                        this.submitButtonDisabled = false;
                        // alert('Got access to rigstered as new Candidate! 1');  
                        getCandidateEmail({email: this.email})
                        .then(res => {       
                            this.submitButtonDisabled = false;
                           this.el= res[0].Email__c;
                            alert('Got access to rigstered as new Candidate!',this.el);       
                        })
                        .catch(error => {
                            this.submitButtonDisabled = true;
                            this.showToast('ERROR','We didn`t find your details with us! Please enter correct email.', 'error');                        
                        });                                     
                    });                    
                   
                
        } 

        // @wire(getCandidateEmail, {email:'$email'})
        // candEmail({data,error}){
        //     if(data){
        //         if (!Array.isArray(data) || data.length === 0){
        //             this.showToast('ERROR','We didn`t find your details with us! Please enter correct email.', 'error');
        //             this.submitButtonDisabled = true;
        //             console.log('Data : ',JSON.stringify(data));
        //         }else if (!Array.isArray(data) || data.length === 1){
        //             this.em=data[0].Email__c;
        //             getCandidate({email: this.em})
        //             .then(result => {       
        //                 this.candId = result[0].Id;
        //                 this.assess = result[0].Assessment__c;
        //                 this.name = result[0].Candidate_Name__c;
        //                 this.error = undefined;
        //                 this.submitButtonDisabled = true;
        //                 alert('Details : '+ this.candId+' - '+this.assess+' - '+this.name );        
        //             })
        //             .catch(error => {
        //                 this.submitButtonDisabled = false;
        //                 alert('Got access to rigstered as new Candidate!');                        
        //             });
        //         }

        //     }if(error){
        //         this.submitButtonDisabled = true;
        //         this.showToast('ERROR',error.body.message, 'error');
        //     }
        // }        
       

        handleClick(event){
            var inp=this.template.querySelectorAll("lightning-input");

            inp.forEach(function(ele){                
                if(ele.name=="name")
                this.name=ele.value;                             
                // if(ele.name=="email")
                // this.email=ele.value;
                if(ele.name=="phone")
                this.phone=ele.value;                                               
            },this);         
            if(this.phone.length!=10){
                this.showToast('ERROR','Please, fill phone number field with 10 digits!', 'error');
                   // alert('Please, fill phone number field with 10 digits!');   
            }                                                
             if(this.email.length>3 && this.name.length>3 && this.phone.length==10 && this.assess.length>3 && this.qual.length>=2){
            var field={'Candidate_Name__c':this.name,'Email__c':this.email,'Phone__c':this.phone,'Assessment__c':this.assess, 'Qualification__c':this.qual}; 
             const can_details={apiName:Cand.objectApiName, fields: field };

             createRecord(can_details)
             .then(response=>{               
               // alert("Candidate is created with ID : "+response.id);  
               this.candId=response.id; 
                this.showModal=true;    
             })
             .catch(error=>{               
                this.showToast('ERROR',error.body.message, 'error');
             });
            }else{
                 this.showToast('ERROR','Please fill all mandatory fields correctly.!', 'error');
              // alert('Please fill all mandatory fields correctly.');
            }
        } 
        
        StartTest(){
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

        closeModal(){
            this.showModal=false;       
        }

        showToast(title, message, variant) {
            const evt = new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            });
            this.dispatchEvent(evt);
        }

}