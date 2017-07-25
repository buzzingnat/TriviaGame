var game = {
	timer: null,
	initialize() {
		this.showRandomImage();
		$(".progress-bar").css("transition", "none");
		$("button.start").on("click", () => this.pressPlay());
	},
	showRandomImage() {
		var image = _.sample(images);
		$("header img")
			.attr("src", image.url)
			.attr("alt", image.alt)
			.attr("title", image.alt);
	},
	pressPlay() {
		// Hide previous game results if they are being displayed.
		$(".end").hide();

		// hide play button
		$("button.start").hide();
		this.showRandomImage();
		// progress bar starts at 100% width and colored success
		$(".progress-bar")
			.css("width", "100%")
			.removeClass("progress-bar-danger")
			.addClass("progress-bar-success");
		// show main game screen and progress bars
		$(".timerDisplay").show();
		this.initializeQuestions();
		// variable for timer length in milliseconds
		var timerLength = 25000;
		var pressTime = Date.now();
		// use setInterval instead
		var timer = setInterval(() => {
			var timePassed = Date.now() - pressTime;
			var timeRemaining = timerLength - timePassed;
			if (timeRemaining <= 0 ) {
				clearInterval(timer);
				this.endGameAndShowResults();
			} else {
				this.animateProgressBar(timerLength, timeRemaining);
			}
		}, 20);
	},
	initializeQuestions() {
		var $questionsList = $(".questions");
		var numberOfQuestions = 7;
		// generate questions randomly from dictionary
		var questionArray = _.shuffle(animals).slice(0, numberOfQuestions);
		// display questions to screen
		for (var question of questionArray) {
			var questionType = _.sample(["group", "kind"]);
			$questionsList.append(this.makeQuestion(question, questionType));
		}
	},
	makeQuestion(questionData, questionType) {
		var question = questionData[questionType];
    	var answerType = questionType === "kind" ? "group" : "kind";
    	var correctAnswer = questionData[answerType];
    	var optionArray = this.makeOptions(correctAnswer, answerType);
    	var questionString = questionType === "kind"
    		? `What do you call a group of ${question}?`
    		: `What kind of animals gather in a ${question}?`;
    	var $questionForm = $(`<form class="form-group" value="${correctAnswer}"></form>`);
    	$questionForm.append(`<legend>${questionString}</legend>`);
    	for (var option of optionArray) {
    		var answerString = `${option}`;
    		if (answerType === "group") answerString = "a " + answerString;
    		var radioButton = `<input type="radio" name="optradio" value="${option}">`;
    		$questionForm.append(`<label class="radio-inline">${radioButton}${answerString}</label>`);
		}
		return $questionForm;
	},
	makeOptions(correctAnswer, qType) {
		var uniqueWrongAnswers = new Set();
		while (uniqueWrongAnswers.size < 3) {
			var randomAnswer = _.sample(animals)[qType];
			if (randomAnswer !== correctAnswer) uniqueWrongAnswers.add(randomAnswer);
		}
		return _.shuffle([correctAnswer, ...uniqueWrongAnswers]);
	},
	animateProgressBar(timerLength, timeRemaining) {
		var $progressBar = $(".progress-bar");
		var liveWidth = (timeRemaining / timerLength) * 100;
		var timeLeft = Math.floor(timeRemaining / 1000);
		$progressBar
			.css("width", `${liveWidth}%`)
			.attr("aria-valuenow", `${Math.round(liveWidth)}%`)
			.html(`${timeLeft} seconds`);
		if ( liveWidth < 20 ) {
			$progressBar
				.removeClass("progress-bar-warning")
				.addClass("progress-bar-danger");
		} else if ( liveWidth < 45 ) {
			$progressBar
				.removeClass("progress-bar-success")
				.addClass("progress-bar-warning");
		}
	},
	endGameAndShowResults() {
		// Calculate the number of correct and wrong answers.
		var correctNum = 0, wrongNum = 0;
		$("form").each(function () {
			var input = $(this).find("input:checked").val();
			var correctAnswer = $(this).attr("value");
			if (input === correctAnswer) correctNum++;
			else wrongNum++;
		});
		// Hide the game state (must be done after we score answers).
		$(".questions").empty();
		$(".timerDisplay").hide();
		// Display the number of correct and wrong answers
		$("#correctNumber").html(correctNum);
		$("#wrongNumber").html(wrongNum);
		$(".end, button.start").show();
	},
	/*
	shuffleArray(array) { // replaced by _.shuffle(array)
		var arrayCopy = array.slice();
        // temporary array for shuffling
        var temp = [];
        // shuffle array into temp array
        while (arrayCopy.length > 0) {
            // a random number between 0 and the length of array, rounded down
            var randIndex = this.randomIndex(arrayCopy);
            // use random number to add element to temporary array
            temp.push(arrayCopy[randIndex]);
            // remove from original array
            arrayCopy.splice(randIndex, 1);
        }
        return temp;
    },
	randomElement(array) { // replaced by _.sample(array)
		return array[this.randomIndex(array)];
	},
	randomIndex(array) { // no longer used
		return Math.floor(Math.random()*array.length);
	},
	*/
};

// Without this arrow function, when jquery calls game.init, it will set `this` to the document element.
$(() => game.initialize());
