import { LightningElement } from 'lwc';

export default class Header extends LightningElement {
    logout(){
        window.location.replace("https://bhavani23-dev-ed.my.site.com/hospital/secur/logout.jsp");
    }
}