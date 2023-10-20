import { LightningElement, track, wire } from "lwc";
import getCandidatesWithResults from "@salesforce/apex/candidatesResult.getCandidatesWithResults";

const columns = [
  {
    label: "S.No",
    fieldName: "rowNumber",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Name",
    fieldName: "candidateName",
    type: "url",
    typeAttributes: { label: { fieldName: "candidateName" }, target: "_blank" }
  },
  { label: "Email", fieldName: "candidateEmail" },
  { label: "Phone", fieldName: "candidatePhone" },
  { label: "Topic", fieldName: "assessment" },
  { label: "Experience", fieldName: "expe" },
  { label: "Date", type: "date", fieldName: "dateField" },
  { label: "Start Time", type: "text", fieldName: "startTime" },
  { label: "End Time", type: "text", fieldName: "endTime" },
  { label: "Duration", type: "text", fieldName: "timeDuration" },
  {
    label: "No.of Q",
    type: "number",
    fieldName: "numberOfQuestions",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Total Marks",
    type: "number",
    fieldName: "totalMarks",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Correct Ans",
    fieldName: "correct",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Wrong Ans",
    fieldName: "wrong",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  { label: "Cutoff %", fieldName: "cuttoffMarks" },
  {
    label: "Score",
    fieldName: "score",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "%",
    fieldName: "percentage",
    type: "number",
    cellAttributes: { alignment: "left" }
  },
  {
    label: "Result",
    fieldName: "Result",
    cellAttributes: {
      class: { fieldName: "qualificationStyle" }
    }
  }
];

export default class CandidateDetailsForm extends LightningElement {
  @track selectedFields = [
    { label: "Name", value: "candidateName" },
    { label: "Email", value: "candidateEmail" },
    { label: "Phone", value: "candidatePhone" }
  ];
  columns = columns;
  data;
  @track search = "";
  @track candidateData = {};

  handleFieldSelection(event) {
    this.selectedFields = event.detail.value;
  }
  get column() {
    return this.selectedFields.map((fieldName) => ({
      label: this.fieldLabels[fieldName],
      fieldName: fieldName
    }));
  }

  formatTime(timeValue) {
    try {
      if (!timeValue) {
        return ""; // Return empty string for NaN values
      }

      const hours = Math.floor(timeValue / 3600000);
      const minutes = Math.floor((timeValue % 3600000) / 60000);
      const seconds = Math.floor((timeValue % 60000) / 1000);

      // Determine AM or PM based on hours
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert to 12-hour format

      return `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")} ${ampm}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return ""; // Return an empty string in case of any errors
    }
  }

  candSearchHandler(event) {
    this.search = event.target.value;
  }
  @wire(getCandidatesWithResults, { Search: "$search" })
  wiredCandidatesWithResults({ error, data }) {
    if (data) {
      this.data = data.map((wrapper, index) => {
        const candidate = wrapper.candidate;
        const result = wrapper.result;
        const candidateId = candidate.Id;
        const exp = candidate.Experience__c;
        const candidateName = `${candidate.Candidate_Name__c}`;
        const cutoffMarks = 70; //candidate.Assessment__r ? candidate.Assessment__r.Cutoff_Marks__c : null;
        const numberOfQuestions = candidate.Assessment__r
          ? candidate.Assessment__r.No_of_Questions_to_Answer__c
          : null;
        const score = result ? result.Score__c : null;
        const correct = result ? result.Correct_Answers__c : null;
        const wrong = result ? result.Wrong_Answers__c : null;
        let totalScore = 0;
        let percentage = "";
        const startTime = candidate.Start_Time__c;
        const endTime = candidate.End_Time__c;
        let qualificationStyle = "slds-text-color_error";
        let isQualified = false;
        totalScore = this.calculateTotalScore(exp, numberOfQuestions);

        if (totalScore > 0) {
          percentage = this.calculatePercentage(totalScore, score);
        }
        if (percentage >= 0) {
          isQualified = percentage && percentage >= cutoffMarks;
          qualificationStyle = isQualified
            ? "slds-text-color_success"
            : "slds-text-color_error";
        }

        const timeDuration = this.calculateTimeDuration(startTime, endTime);

        return {
          rowNumber: index + 1,
          //candidateId: candidate.Id,
          candidateId: candidateId,
          candidateName: candidateName,
          //candidateName: candidate.Candidate_Name__c,
          candidateEmail: candidate.Email__c,
          candidatePhone: candidate.Phone__c,
          assessment: candidate.Assessment__r
            ? candidate.Assessment__r.Name
            : "",
          expe: exp,
          dateField: candidate.Date__c,
          startTime: this.formatTime(candidate.Start_Time__c),
          endTime: this.formatTime(candidate.End_Time__c),
          numberOfQuestions: numberOfQuestions,
          cuttoffMarks: cutoffMarks,
          score: score,
          correct: correct,
          totalMarks: totalScore,
          wrong: wrong,
          percentage: percentage,
          Result: isQualified ? "Qualified" : "Not Qualified",

          timeDuration: timeDuration,

          qualificationStyle: qualificationStyle
        };
      });
    } else if (error) {
      this.error = error;
      // Handle error if necessary
    }
  }

  calculatePercentage(numberOfQuestions, score) {
    try {
      if (!numberOfQuestions || !score || score == 0) {
        return 0; // Return empty string if either numberOfQuestions or score is missing
      } else {
        // Calculate the percentage
        const percentage = (score / numberOfQuestions) * 100;

        // Round the percentage to two decimal places
        return parseFloat(percentage.toFixed(2));
      }
    } catch (error) {
      console.error("Error in calculating Percentage:", error);
      return ""; // Return an empty string in case of any errors
    }
  }

  calculateTotalScore(exp, numberOfQuestions) {
    const num = numberOfQuestions;
    if (exp == "0 to 2 years") {
      const easy = Math.floor(num - num * 0.5);
      const med = Math.floor(num - num * 0.7);
      const hard = Math.floor(num - num * 0.8);
      return easy * 1 + med * 2 + hard * 3;
    } else if (exp == "2 to 4 years") {
      const easy = Math.floor(num - num * 0.6);
      const med = Math.floor(num - num * 0.6);
      const hard = Math.floor(num - num * 0.8);
      return easy * 1 + med * 2 + hard * 3;
    } else if (exp == "4 to 6 years") {
      const easy = Math.floor(num - num * 0.7);
      const med = Math.floor(num - num * 0.6);
      const hard = Math.floor(num - num * 0.7);
      return easy * 1 + med * 2 + hard * 3;
    } else {
      const easy = Math.floor(num - num * 0.8);
      const med = Math.floor(num - num * 0.6);
      const hard = Math.floor(num - num * 0.6);
      return easy * 1 + med * 2 + hard * 3;
    }
  }

  calculateTimeDuration(startTime, endTime) {
    try {
      if (!startTime || !endTime) {
        return ""; // Return empty string if either startTime or endTime is missing
      }

      const startDateTime = new Date(startTime).getTime();
      const endDateTime = new Date(endTime).getTime();
      const timeDiffInSeconds = Math.floor(
        (endDateTime - startDateTime) / 1000
      ); // Calculate the time difference in seconds

      let duration = "";

      if (timeDiffInSeconds >= 3600) {
        const hours = Math.floor(timeDiffInSeconds / 3600);
        duration += `${hours} hour${hours > 1 ? "s" : ""} `;
      }

      if (timeDiffInSeconds >= 60) {
        const minutes = Math.floor((timeDiffInSeconds % 3600) / 60);
        duration += `${minutes} Min${minutes > 1 ? "s" : ""} `;
      }

      const seconds = timeDiffInSeconds % 60;
      duration += `${seconds} Sec${seconds !== 1 ? "s" : ""}`;

      return duration;
    } catch (error) {
      console.error("Error calculating time difference:", error);
      return ""; // Return an empty string in case of any errors
    }
  }
}
