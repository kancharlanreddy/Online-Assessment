({
    init : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
         var candId = myPageRef.state.c__candId;
        var assessId=myPageRef.state.c__assessId;
        var assessName=myPageRef.state.c__assessName;
        var candName = myPageRef.state.c__candName;
        // console.log('Candidate Id : ',candId);
         component.set("v.candId", candId);
         component.set("v.candName", candName);
      //  console.log('Assessment Id : ',assessId);
        component.set("v.assessId", assessId);
        component.set("v.assessName", assessName);
    }
})
