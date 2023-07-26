import { LightningElement, api, track, wire } from 'lwc';
import getAllQuestions from '@salesforce/apex/assessment.getAllQuestions';
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import result from '@salesforce/schema/Result__c';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const { setInterval, clearTimeout } = window;

export default class Questions extends NavigationMixin(LightningElement) {

 candId;
 assessId;
 assessName;
 candName;
 exp;
 
numQues=0;
numMins=0;
Minutes;

@track showModal = false;
closeModal(){
    this.showModal=false;
    this.submitButtonDisabled = false;       
}
@track showModal1 = false;
closeModal1(){
    this.showModal1=false;       
}
@track showModal2 = false;
closeModal2(){
    this.showModal2=false;   
    window.location.replace("https://bhavani23-dev-ed.my.site.com/hospital/secur/logout.jsp");
}
@track showModal3 = false;
closeModal3(){
    this.showModal3=false;       
}

@track examStarted = false;
    @track questionWrapper =[];
    @track selectedAssessmentId=this.assessId;   

    @track submitButtonDisabled = false;
    @track assessmentSelected = false;
    @track shuffledQuestionWrapper = [];
    
    timerInterval;
    timerMinutes = this.numMins;
    timerSeconds = '00';
    timer;
    @track score = 0;
    @track selectedAnswer;         

  //   constructor() {
  //     super();          
  //    window.addEventListener('beforeunload', (event) => {
  //     // Cancel the event as stated by the standard.
  //     event.preventDefault();
  //     // Chrome requires returnValue to be set.
  //     event.returnValue = 'sample value';

  //     });
  //  }
  
    connectedCallback(){      
      window.addEventListener('blur', this.handleBlur);

      let oldurl=window.location.href;
      let newurl=new URL(oldurl).searchParams;
      this.candId= newurl.get('candId');
      this.candName= newurl.get('candName');
      this.assessId= newurl.get('assessId');
      this.assessName= newurl.get('assessName');
      this.exp= newurl.get('exp');
      this.numQues= newurl.get('numQues');
      this.numMins= newurl.get('numMins');
      this.Minutes=this.numMins+' : 00 Mins';
     // console.log('candidate Id:'+this.candId+', candidate Name:'+this.candName+', Assessment Name:'+this.assessName+', Assessment Id:'+this.assessId);
    
      //Updating Start time in candidate object
      const startTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;

       const candRecord = {
        fields: {
            Id: this.candId,
            Start_Time__c: startTime,
            Date__c: currentDate
        }
      };

        updateRecord(candRecord)
        .then(() => {
            console.log('Candidate record updated with Start time');
        })
        .catch(error => {
            console.error('Error updating Candidate record Start time:', error);
        });
        //Updating Start time in candidate object completed here...


    }   
    disconnectedCallback() {
      // Remove the 'blur' event listener when the component is removed    
      window.removeEventListener('blur', this.handleBlur());
    }  
  
    handleBlur() {     
      var data = window.sessionStorage.getItem('somekey');
      if (data !== null) {    
        sessionStorage.removeItem("somekey");
       
      //  this.showToast('ERROR','You can`t switch in between browser tabs, can`t hover on other apps!! If you lose focus one more time, we will automatically signedout you.', 'error');    
        alert('You can`t switch in between browser tabs, can`t hover on other apps!! If you lose focus one more time, we will automatically signedout you.'); 
      } else {
       // alert('Logout Functionality! '); 
        window.location.replace("https://bhavani23-dev-ed.my.site.com/hospital/secur/logout.jsp");        
      }
      
    }    
//     import { CurrentPageReference } from 'lightning/navigation';

//         currentPageReference = null;

//  @wire(CurrentPageReference)
//     getStateParameters(currentPageReference) {
//        if (currentPageReference) {
//            this.caseId = currentPageReference.state.caseRecordId;
//        }
//     }

    startTimer() {
        let seconds = this.numMins * 60;
       this.timerInterval = setInterval(() => {
            seconds--;
            this.timerMinutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            this.timerSeconds = (seconds % 60).toString().padStart(2, '0');

            if(seconds==30){
              this.showModal1=true; 
            }

            if (seconds === 0) {
               // this.showModal=true;               
                clearInterval(this.timerInterval);
                this.Finish();
            }
        }, 1000);
    }   

    handleTimeUp() {
      clearInterval(this.timerInterval);
    }  

        @wire(getAllQuestions, { assessment: '$assessId', numQue: '$numQues', ex:'$exp' })
            ques({data,error}){
                if(data){                
                    // console.log('Assessment Id : ', this.assessId);    
                this.examStarted = true;
                this.questionWrapper = data;
                console.log('Q Lenght: ',this.questionWrapper.length);
                this.startTimer();
                }
                if(error){                   
                    this.showToast('ERROR','Error fetching questions: '+error.body.message, 'error');
                }                
            }

    onSubmit(event) {
      this.submitButtonDisabled = true;
      this.showModal=true;
    }
    Finish(){
      this.showModal=false; 
      this.submitButtonDisabled = true;
        let score = 0; let cq=0;
        for (let i = 0; i < this.questionWrapper.length; i++) {
            const question = this.questionWrapper[i].question;
            const selectedOption = this.questionWrapper[i].selectedAnswer;
            if (selectedOption === question.Answer__c) {
                score+=question.Marks__c;
                cq+=1;
            }
        }
        let wrong=this.questionWrapper.length-cq;
        // alert('Your Score Is ' + score);
       
       var field={'Correct_Answers__c':cq,'Score__c':score,'Candidate__c':this.candId,'Assesment__c':this.assessId, 'Wrong_Answers__c':wrong}; 
             const res_details={apiName:result.objectApiName, fields: field };

             createRecord(res_details)
             .then(response=>{               
                //alert("Result is created with ID : "+response.id);    
                // this.showToast('Success',"Result is created with ID : "+response.id, 'success');            
                this.handleTimeUp();

                //Updating end time in candidate object
                const endTime = new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
              });

                 const candidateRecord = {
            fields: {
                Id: this.candId,
                End_Time__c: endTime
            }
        };

        updateRecord(candidateRecord)
            .then(() => {
                console.log('Candidate record updated with end time');
            })
            .catch(error => {
                console.error('Error updating Candidate record:', error);
            });
            //Updating end time in candidate object completed here...


               this.showModal2=true;    
             })
             .catch(error=>{               
                //alert("Some error has occured :"+JSON.stringify(error)+this.candId);
                this.showToast('ERROR',error.body.message, 'error');
             });
    }  

    startTest() {
        this.examStarted = true;
        this.questionWrapper = this.questions.map((question, index) => ({
          qNo: index + 1,
          question: question,
          options: question.Options,
          selectedAnswer: null
        }));
        this.startTimer();
      } 

      handleOptionChange(event) {
        const selectedOption = event.detail.value;
        const questionId = event.target.name;      

        // Find the index of the question in the questionWrapper array based on questionId
        const questionIndex = this.questionWrapper.findIndex((q) => q.question.Id === questionId);      

        // Make a deep copy of the question object
        const updatedQuestion = { ...this.questionWrapper[questionIndex] };       

        // Check if the selected option is the same as the currently selectedAnswer
        if (updatedQuestion.selectedAnswer === selectedOption) {

        // Deselect the option
          updatedQuestion.selectedAnswer = null;
        } else {         
          // Select the option
          updatedQuestion.selectedAnswer = selectedOption;
        }
        // Update the questionWrapper array with the modified question object
        this.questionWrapper = [
          ...this.questionWrapper.slice(0, questionIndex),
          updatedQuestion,
          ...this.questionWrapper.slice(questionIndex + 1)
        ];
       // console.log('Selected Option: ',this.questionWrapper); // For testing and debugging
      }

      handleResetClick(event) {
        const questionId = event.target.dataset.questionid;
        const questionIndex = this.questionWrapper.findIndex(question => question.question.Id === questionId);
        
        if (questionIndex !== -1) {
            this.questionWrapper[questionIndex].selectedAnswer = null;         
        }
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
