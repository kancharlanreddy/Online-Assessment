public with sharing class assessment {
  @AuraEnabled(cacheable=true)
  public static List<QuestionWrapper> getAllQuestions(
    String assessment,
    Integer numQue,
    string ex
  ) {
    Integer easy;
    Integer med;
    Integer hard;
    Integer j = 1;

    Integer num = numQue;

    if (ex == '0 to 2 years') {
      easy = (Integer) Math.floor(num - num * 0.5);
      med = (Integer) Math.floor(num - num * 0.7);
      hard = (Integer) Math.floor(num - num * 0.8);
    } else if (ex == '2 to 4 years') {
      easy = (Integer) Math.floor(num - num * 0.6);
      med = (Integer) Math.floor(num - num * 0.6);
      hard = (Integer) Math.floor(num - num * 0.8);
    } else if (ex == '4 to 6 years') {
      easy = (Integer) Math.floor(num - num * 0.7);
      med = (Integer) Math.floor(num - num * 0.6);
      hard = (Integer) Math.floor(num - num * 0.7);
    } else {
      easy = (Integer) Math.floor(num - num * 0.8);
      med = (Integer) Math.floor(num - num * 0.6);
      hard = (Integer) Math.floor(num - num * 0.6);
    }
    System.debug('Value of easy: ' + easy);
    System.debug('Value of med: ' + med);
    System.debug('Value of med: ' + hard);

    List<QuestionWrapper> qwList = new List<QuestionWrapper>();
    // Retrieve questions based on the selected assessment
    List<Question__c> questionList1 = [
      SELECT
        Id,
        Name,
        Question__c,
        OptionA__c,
        OptionB__c,
        OptionC__c,
        OptionD__c,
        Answer__c,
        Marks__C
      FROM Question__c
      WHERE Assesment__c = :assessment AND Type__c = 'Easy'
    ];

    List<Question__c> questionList2 = [
      SELECT
        Id,
        Name,
        Question__c,
        OptionA__c,
        OptionB__c,
        OptionC__c,
        OptionD__c,
        Answer__c,
        Marks__C
      FROM Question__c
      WHERE Assesment__c = :assessment AND Type__c = 'Medium'
    ];

    List<Question__c> questionList3 = [
      SELECT
        Id,
        Name,
        Question__c,
        OptionA__c,
        OptionB__c,
        OptionC__c,
        OptionD__c,
        Answer__c,
        Marks__C
      FROM Question__c
      WHERE Assesment__c = :assessment AND Type__c = 'Hard'
    ];

    System.debug('Value of easyList: ' + questionList1.size());
    System.debug('Value of mediumList: ' + questionList2.size());
    System.debug('Value of HardList: ' + questionList3.size());

    if (questionList1 != null && questionList1.size() > 0) {
      Integer[] randomOrder = getRandomOrder(questionList1.size());
      Integer i = 1;
      for (Integer index : randomOrder) {
        if (i <= easy) {
          Question__c question = questionList1[index];
          List<Options> optionsList = new List<Options>();
          QuestionWrapper qw = new QuestionWrapper();
          qw.question = question;
          qw.qNo = j;
          qw.selectedAnswer = '';
          optionsList.add(new Options(question.OptionA__c, 'A'));
          optionsList.add(new Options(question.OptionB__c, 'B'));
          optionsList.add(new Options(question.OptionC__c, 'C'));
          optionsList.add(new Options(question.OptionD__c, 'D'));
          qw.options = optionsList;
          qwList.add(qw);
          i++;
          j++;
        }
      }
      // return qwList;
    } else {
      //  return null;
    }

    if (questionList2 != null && questionList2.size() > 0) {
      Integer[] randomOrder = getRandomOrder(questionList2.size());
      Integer i = 1;
      for (Integer index : randomOrder) {
        if (i <= med) {
          Question__c question = questionList2[index];
          List<Options> optionsList = new List<Options>();
          QuestionWrapper qw = new QuestionWrapper();
          qw.question = question;
          qw.qNo = j;
          qw.selectedAnswer = '';
          optionsList.add(new Options(question.OptionA__c, 'A'));
          optionsList.add(new Options(question.OptionB__c, 'B'));
          optionsList.add(new Options(question.OptionC__c, 'C'));
          optionsList.add(new Options(question.OptionD__c, 'D'));
          qw.options = optionsList;
          qwList.add(qw);
          i++;
          j++;
        }
      }
      // return qwList;
    } else {
      //  return null;
    }

    if (questionList3 != null && questionList3.size() > 0) {
      Integer[] randomOrder = getRandomOrder(questionList3.size());
      Integer i = 1;
      for (Integer index : randomOrder) {
        if (i <= hard) {
          Question__c question = questionList3[index];
          List<Options> optionsList = new List<Options>();
          QuestionWrapper qw = new QuestionWrapper();
          qw.question = question;
          qw.qNo = j;
          qw.selectedAnswer = '';
          optionsList.add(new Options(question.OptionA__c, 'A'));
          optionsList.add(new Options(question.OptionB__c, 'B'));
          optionsList.add(new Options(question.OptionC__c, 'C'));
          optionsList.add(new Options(question.OptionD__c, 'D'));
          qw.options = optionsList;
          qwList.add(qw);
          i++;
          j++;
        }
      }
      // return qwList;
    } else {
      //  return null;
    }

    if (qwList.size() > 0) {
      return qwList;
    } else {
      return null;
    }
  }

  private static Integer[] getRandomOrder(Integer size) {
    Integer[] order = new List<Integer>(size);
    for (Integer i = 0; i < size; i++) {
      order[i] = i;
    }

    // Perform Fisher-Yates shuffle algorithm
    for (Integer i = size - 1; i > 0; i--) {
      Integer j = (Integer) Math.floor(Math.random() * (i + 1));
      Integer temp = order[i];
      order[i] = order[j];
      order[j] = temp;
    }
    return order;
  }

  public class QuestionWrapper {
    @AuraEnabled
    public Question__c question;
    @AuraEnabled
    public Integer qNo;
    @AuraEnabled
    public List<Options> options;
    @AuraEnabled
    public String selectedAnswer;
  }

  public class Options {
    @AuraEnabled
    public String label;
    @AuraEnabled
    public String value;

    public Options(String label, String value) {
      this.label = label;
      this.value = value;
    }
  }
}
