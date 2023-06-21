public with sharing class candidate {
   
    @AuraEnabled(cacheable=true)
    public static list<Assessment__c> getAssess(){
        return [SELECT Id,Name,No_of_Questions_to_Answer__c,Time__c FROM Assessment__c];     
    }

    @AuraEnabled(cacheable=true)
    public static list<Assessment__c> getAssessDet(string assId){
        return [SELECT Id,No_of_Questions_to_Answer__c,Time__c FROM Assessment__c where Id =: assId];     
    }
}
    