import { LightningElement, wire, track } from 'lwc';
import getAssess from '@salesforce/apex/candidate.getAssess';
import { createRecord } from 'lightning/uiRecordApi';
import Cand from '@salesforce/schema/Candidate__c';

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


    connectedCallback() {
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
            if(this.assessName=='Salesforce'){
                this.numQues=4;
                this.numMins=4;
            }
            if(this.assessName=='SQL'){
                this.numQues=3;
                this.numMins=3;
            }
            if(this.assessName=='Java'){
                this.numQues=2;
                this.numMins=2;
            }

        }  
        
        handleQualiChange(event){
            this.qual = event.target.value; 
            //this.assessName=event.target.options.find(opt => opt.value === event.detail.value).label;            
        }  

        handleClick(event){
            var inp=this.template.querySelectorAll("lightning-input");

            inp.forEach(function(ele){                
                if(ele.name=="name")
                this.name=ele.value;                             
                if(ele.name=="email")
                this.email=ele.value;
                if(ele.name=="phone")
                this.phone=ele.value;                              
            },this);            

            var field={'Candidate_Name__c':this.name,'Email__c':this.email,'Phone__c':this.phone,'Assessment__c':this.assess, 'Qualification__c':this.qual}; 
             const can_details={apiName:Cand.objectApiName, fields: field };

             createRecord(can_details)
             .then(response=>{               
               // alert("Candidate is created with ID : "+response.id);  
               this.candId=response.id; 
                this.showModal=true;    
             })
             .catch(error=>{
                console.log('Name',this.name,'Email__c',this.email,'Phone__c',this.phone,'Assessment__c',this.assess,'Date',this.date,'Qualification__c',this.qual);
                alert("Some error has occured :"+JSON.stringify(error));
             });

        }  
        
        StartTest(){
            this[NavigationMixin.Navigate]({
                type: "standard__component",
                attributes: {
                    componentName: "c__NavigationToQuesHelper"
                },
                state: {
                     c__candId: this.candId,   
                    c__assessId:this.assess
                }
            });
        }

        closeModal(){
            this.showModal=false;       
        }

}