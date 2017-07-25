var game = {
	questionIndex: 1,
	questionArray: null,
	timer: null,
	init: function() {
		// initialize game
		$(".questions").hide();
		$(".timerDisplay").hide();
		game.reset();
	},
	reset: function() {
		game.questionIndex = 1;
		$(".questions").empty();
		game.questionArray = null;
		game.timer = null;
		$(".end").hide();
		// progress bar starts at 0% width and colored success
		$(".progress-bar").css("width", "100%");
		$(".progress-bar").removeClass("progress-bar-danger");
		$(".progress-bar").addClass("progress-bar-success");
		game.showRandomImage();
	},
	showRandomImage: function() {
		var image = images[game.randomIndex(images)];
		$("header img").attr("src", image.url);
		$("header img").attr("alt", image.alt);
		$("header img").attr("title", image.alt);
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
		var result = game.checkAnswers();
		$("#correctNumber").html(result.correct);
		$("#wrongNumber").html(result.wrong);
	},
	animateProgressBar: function(timerLength, pressTime) {
		var numerator = Date.now() - pressTime;
		var divisor = timerLength;
		var liveWidth = 100 - (numerator/divisor) * 100;
		var timeLeft = Math.floor((divisor-numerator)/1000);
		$(".progress-bar").css("width", `${liveWidth}%`);
		$(".progress-bar").attr("aria-valuenow", `${Math.round(liveWidth)}%`);
		$(".progress-bar").html(`${timeLeft} seconds`);
		if ( Date.now() > (pressTime + (timerLength*.55)) ) {
			$(".progress-bar").removeClass("progress-bar-success");
			$(".progress-bar").addClass("progress-bar-warning");
		}
		if ( Date.now() > (pressTime + (timerLength*.8)) ) {
			$(".progress-bar").removeClass("progress-bar-warning");
			$(".progress-bar").addClass("progress-bar-danger");
		}
	},
	pressPlay: function() {
		// reset to start from scratch
		game.reset();
		// show main game screen and progress bars
		$(".questions").show();
		$(".timerDisplay").show();
		// hide play button
		$("button").hide();
		// generate questions randomly from dictionary
		game.createQuestionArray(animals);
		// display questions to screen
		for (var i = 0; i < 7; i++) {
			game.buildQuestion();
		}
		// variable for timer length in milliseconds
		var timerLength = 25000;
		var pressTime = Date.now();
		var width = 0;
		$(".progress-bar").css("transition", "none");
		// use setInterval instead
		game.timer = setInterval(function() {
			if ( Date.now() > (pressTime + timerLength) ) {
				clearInterval(game.timer);
				game.onTimeEnd();
			}
			game.animateProgressBar(timerLength, pressTime);
		}, 20);
	},
	checkAnswers: function() {
		var correctNum = 0, wrongNum = 0;
		// when timer ends, check whether selected answers are correct
		$("form").each(function(index){
			var input = $(this).find("input:checked").val();
			var correctAnswer = $(this).attr("value");
			var allOptions = [];
			$(this).find("input").each(function(index){
				allOptions.push($(this).val());
			});
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
		var randomIndex = game.randomIndex(questionTypes);
		return questionTypes[randomIndex];
	},
	shuffleArray: function(array) {
        // temporary array for shuffling
        var temp = [];
        // shuffle array into temp array
        while (array.length > 0) {
            // a random number between 0 and the length of array, rounded down
            var randIndex = game.randomIndex(array);
            // use random number to add element to temporary array
            temp.push(array[randIndex]);
            // remove from original array
            array.splice(randIndex, 1);
        }
        return temp;
    },
    createQuestionArray: function(array) {
        var randomArray = array.slice();
        randomArray = game.shuffleArray(randomArray);
        game.questionArray = randomArray;
    },
	makeOptions: function(correctAnswer, qType) {
		var uniqueOptions = new Set();
		while (uniqueOptions.size < 4) {
			var randomAnswer = animals[game.randomIndex(animals)][qType];
			if (randomAnswer !== correctAnswer) uniqueOptions.add(randomAnswer);
		}
		var options = [...uniqueOptions];
		options.splice(game.randomIndex(options), 1, correctAnswer);
		return options;
	},
	buildQuestion: function() {
		// build the html dynamically
    	var questionType = game.pickQuestionType();
    	var question = game.questionArray[0][questionType];
    	var answerType = questionType === "kind" ? answerType = "group" : answerType = "kind";
    	var correctAnswer = game.questionArray[0][answerType];
    	var optionArray = game.makeOptions(correctAnswer, answerType);
    	var questionString = questionType === "kind" ?
    		questionString = `What do you call a group of ${question}?` :
    		`What kind of animals gather in a ${question}?`;
    	var $outside = $(`<form class="form-group" id="question${game.questionIndex}" value="${correctAnswer}"></form>`);
    	var $legend = $outside.append(`<legend>${questionString}</legend>`);
    	for (var i = 0; i < 4; i++) {
    		var answerString = `${optionArray[i]}`;
    		if (answerType === "group") answerString = "a " + answerString;
    		var labelHTML = `<input type="radio" name="optradio" value="${optionArray[i]}">`;
    		var $option = $outside.append(`<label class="radio-inline">${labelHTML}${answerString}</label>`);
		}
		// append it to the questions section
		$(".questions").append($outside);
		game.questionIndex++;
		game.questionArray.splice(0, 1);
	},
}

$().ready(function() {
	game.init();
});

$("button.start").on("click", game.pressPlay);
