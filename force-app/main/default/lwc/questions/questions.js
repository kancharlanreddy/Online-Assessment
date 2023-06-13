import { LightningElement, api, track, wire } from 'lwc';
import getAssess from '@salesforce/apex/assessment.getAssess';

export default class Questions extends LightningElement {

@api candId;
@api assessId;

assessName;
candName;
numQues=0;
numMins=0;

@track showModal = false;

connectedCallback(){
    getAssess({assessId: this.assessId})
    .then(response =>{             
                this.assessName=response;
                title=this.assessName;
                this.showModal=true;   
                console.log("Assess Name : ", this.title);
            })
            .catch(error => {
                this.error = error;
                console.log("Err Msg : ", this.error);
            });
}

closeModal(){
    this.showModal=false;       
}

}