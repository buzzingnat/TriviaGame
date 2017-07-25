var hard = {
	questionIndex: 1,
	questionArray: null,
	timer: null,
	reset: function() {
		hard.questionIndex = 1;
		$(".questions").empty();
		hard.questionArray = null;
		hard.timer = null;
		$(".end").hide();
		// progress bar starts at 0% width and colored success
		$(".progress-bar").css("width", "0%");
		$(".progress-bar").removeClass("progress-bar-danger");
		$(".progress-bar").addClass("progress-bar-success");
		hard.showRandomImage();
	},
	showRandomImage: function() {
		var image = images[hard.randomIndex(images)];
		$("header img").attr("src", image.url);
		$("header img").attr("alt", image.alt);
		console.log(image.alt)
	},
	onTimeEnd: function() {
		// hide main game screen and progress bars
		$(".questions").hide();
		$(".timerDisplay").hide();
		// show end screen
		$(".end").show();
		// show play button
		$("button").show();
		// check answers
		var result = hard.checkAnswers();
		$("#correctNumber").html(result.correct);
		$("#wrongNumber").html(result.wrong);
	},
	animateProgressBar: function(timerLength, pressTime, timeLeft) {
		var numerator = timeLeft;
		var divisor = timerLength;
		var liveWidth = Math.floor((numerator/divisor) * 100);
		$(".progress-bar").css("width", `${liveWidth}%`);
		$(".progress-bar").attr("aria-valuenow", `${liveWidth}%`);
		$(".progress-bar").html(`${timeLeft} seconds`);
		if ( timeLeft > timerLength * .55 ) {
			$(".progress-bar").removeClass("progress-bar-success");
			$(".progress-bar").addClass("progress-bar-warning");
		}
		if ( timeLeft > timerLength * .8 ) {
			$(".progress-bar").removeClass("progress-bar-warning");
			$(".progress-bar").addClass("progress-bar-danger");
		}
	},
	nextQuestion: function() {
		$(".end").hide();
		hard.buildQuestion();
	},
	pressPlay: function() {
		// reset to start from scratch
		hard.reset();
		// show main game screen and progress bars
		$(".questions").show();
		$(".timerDisplay").show();
		// hide play button
		$("button").hide();
		// generate questions randomly from dictionary
		hard.createQuestionArray(animals);
		hard.buildQuestion();
		$(".progress-bar").css("transition", "all .7s");
		setTimeout(hard.onTimeEnd, 12000);
	},
	createTimer: function() {
		// variable for timer length in milliseconds
		var timerLength = 3000;
		var pressTime = Date.now();
		var width = 0;
		hard.timer = setInterval(function() {
			var timeLeft = Math.floor( (timerLength - (Date.now()-pressTime) )/1000);
			if ( timeLeft < 1 ) {
				clearInterval(hard.timer);
				hard.displayResult();
			}
			hard.animateProgressBar(timerLength, pressTime, timeLeft);
		}, 100);
	},
	displayResult: function() {
		var questionText = $("form").find("legend").text();
		var input = $("form").find("input:checked").val();
		var correctAnswer = $("form").attr("value");
		$(".questions form").hide();
		$(".questions").hide();
		$(".end").show();
		$(".end .row").hide();
		$(".end .lead").after(`<p class="questionText">The correct answer to <em>${questionText}</em> was:</p>`);
		$(".end .questionText").after(`<p class="correctAnswer"><strong>${correctAnswer}</strong></p>`);
		$(".end .correctAnswer").after(`<p class="userAnswer">You answered: <strong>${input}</strong></p>`);
		$(".end .userAnswer").after(`<button class="">`);
	},
	clickNext: function() {
		hard.nextQuestion();
	},
	checkAnswers: function() {
		var correctNum = 0, wrongNum = 0;
		// when timer ends, check whether selected answers are correct
		$("form").each(function(index){
			var input = $(this).find("input:checked").val();
			var correctAnswer = $(this).attr("value");
			if (input === correctAnswer) {
				correctNum++;
			} else {
				wrongNum++;
			}
		});
		// return number of correct answers and number of wrong answers
		return {correct: correctNum, wrong: wrongNum};
	},
	randomIndex: function(array) {
		return Math.floor(Math.random()*array.length);
	},
	pickQuestionType: function() {
		var questionTypes = ["group", "kind"];
		var randomIndex = hard.randomIndex(questionTypes);
		return questionTypes[randomIndex];
	},
	shuffleArray: function(array) {
        // temporary array for shuffling
        var temp = [];
        // shuffle array into temp array
        while (array.length > 0) {
            // a random number between 0 and the length of array, rounded down
            var randIndex = hard.randomIndex(array);
            // use random number to add element to temporary array
            temp.push(array[randIndex]);
            // remove from original array
            array.splice(randIndex, 1);
        }
        return temp;
    },
    createQuestionArray: function(array) {
        var randomArray = array.slice();
        randomArray = hard.shuffleArray(randomArray);
        hard.questionArray = randomArray;
    },
	makeOptions: function(correctAnswer, qType) {
		var uniqueOptions = new Set();
		while (uniqueOptions.size < 4) {
			var randomAnswer = animals[hard.randomIndex(animals)][qType];
			if (randomAnswer !== correctAnswer) uniqueOptions.add(randomAnswer);
		}
		var options = [...uniqueOptions];
		options.splice(hard.randomIndex(options), 1, correctAnswer);
		return options;
	},
	buildQuestion: function() {
		// build the html dynamically
    	var questionType = hard.pickQuestionType();
    	var question = hard.questionArray[0][questionType];
    	var answerType = questionType === "kind" ? answerType = "group" : answerType = "kind";
    	var correctAnswer = hard.questionArray[0][answerType];
    	var optionArray = hard.makeOptions(correctAnswer, answerType);
    	var questionString = questionType === "kind" ?
    		questionString = `What do you call a group of ${question}?` :
    		`What kind of animals gather in a ${question}?`;
    	var $outside = $(`<form class="form-group" id="question${hard.questionIndex}" value="${correctAnswer}"></form>`);
    	var $legend = $outside.append(`<legend>${questionString}</legend>`);
    	for (var i = 0; i < 4; i++) {
    		var answerString = `${optionArray[i]}`;
    		if (answerType === "group") answerString = "a " + answerString;
    		var labelHTML = `<input type="radio" name="optradio" value="${optionArray[i]}">`;
    		var $option = $outside.append(`<label class="radio-inline">${labelHTML}${answerString}</label>`);
		}
		// append it to the questions section
		$(".questions").append($outside);
		hard.questionIndex++;
		hard.questionArray.splice(0, 1);
	},
}

$("button.hardMode").on("click", hard.pressPlay);
