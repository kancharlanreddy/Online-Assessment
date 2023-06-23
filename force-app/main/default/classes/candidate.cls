public with sharing class candidate {
   
    @AuraEnabled(cacheable=true)
    public static list<Assessment__c> getAssess(){
        return [SELECT Id,Name,No_of_Questions_to_Answer__c,Time__c FROM Assessment__c];     
    }

    @AuraEnabled(cacheable=true)
    public static list<Assessment__c> getAssessDet(string assId){
        return [SELECT Id,Name,No_of_Questions_to_Answer__c,Time__c FROM Assessment__c where Id =: assId];     
    }

    @AuraEnabled(cacheable=true)
    public static list<candidate__c> getCandidate(string email){
        return [SELECT Id,Assessment__c,Candidate_Name__c FROM candidate__c where Email__c =: email];     
    }

    @AuraEnabled(cacheable=true)
    public static list<result__c> getCandidateResult(string cand){
        return [SELECT Assesment__c,Candidate__c,Score__c,Wrong_Answers__c FROM result__c where Candidate__c =: cand];     
    }
}
    