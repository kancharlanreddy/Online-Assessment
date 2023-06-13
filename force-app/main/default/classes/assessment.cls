public with sharing class assessment {
    
    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssess(string assessId){
        return [select Name from Assessment__c where id=: assessId];
    }
}