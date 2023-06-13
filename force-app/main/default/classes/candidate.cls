public with sharing class candidate {
   
    @AuraEnabled(cacheable=true)
    public static list<Assessment__c> getAssess(){
        return [SELECT Id,Name FROM Assessment__c];     
    }
}
    