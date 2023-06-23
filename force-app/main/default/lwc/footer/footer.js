import { LightningElement } from 'lwc';

export default class Footer extends LightningElement {

    
    connectedCallback() { 
        const today = new Date();
        const year = today.getFullYear();         
        this.footer= '© '+year+' Roothoot (P) Ltd. | All Rights Reserved.';
    }     

}