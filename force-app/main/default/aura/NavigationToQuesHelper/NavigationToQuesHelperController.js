({
    init : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
         var candId = myPageRef.state.c__candId;
        var assessId=myPageRef.state.c__assessId;
         console.log('Candidate Id : ',candId);
         component.set("v.candId", candId);
        console.log('Assessment Id : ',assessId);
        component.set("v.assessId", assessId);
    }
})
