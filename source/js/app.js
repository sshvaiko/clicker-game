;(function($) {

  // parameters and selectors
  const peopleContainer = $('.js-container');
  const progressBar = $('.game__progress');
  const countdownCircle = $('.js-countdown');
  const countdownElement = $('.js-countdown-text');
  const roundNumber = $('.js-round');
  const attempts = $('.js-attempts');
  const attemptsLabel1 = $('.js-attempts-label-1');
  const attemptsLabel = $('.js-attempts-label');
  const resultFalse = $('.game__result_false');
  const resultTrue = $('.game__result_true');
  const skipBtn = $('.js-skip');

  const peopleLimit = 8;
  const totalRounds = 4;
  const attemptsNumber = 3;

  /**
   * Generates the random number.
   *
   * @param  {number} - Min number.
   * @param  {number} - Max number.
   * @return {number} - The random number.
   */
  const randomNumber = (min, max) => {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
  }

  /**
   * Capitalises first letter.
   *
   * @param  {string} - The words.
   * @return {string} - The word with a capital letter.
   */
  const capitalizeFirstLetter = string => {
    return string.replace(/\b./g,
      function(l) {
        return l.toUpperCase();
      });
  }

  /**
   * Animates circle countdown.
   *
   * @param  {number} - Time in seconds.
   */
  const animateCircleCountdown = time => {

    // clear
    countdownCircle.empty();
    countdownElement.empty();

    let timeLeft = time;

    // text counter
    const countdown = () => {
      if (timeLeft == -1) {
        clearTimeout(timerId);
      } else {
        countdownElement.text(timeLeft);
        timeLeft--;
      }
    }

    // run the first iteration (without delay) and then the rest
    //     clearInterval(timerId);
    countdown();
    let timerId = setInterval(countdown, 1000);

    // use library to animate circle
    const circle = new ProgressBar.Circle('.js-countdown', {
      color: '#ffffff',
      trailColor: '#ff567b',
      duration: time * 1000,
      easing: 'linear',
      strokeWidth: 5,
      trailWidth: 5
    });
    circle.animate(1);
    return timerId;
  }

  /**
   * Renders people.
   *
   * @param  {array} - An array with data.
   */
  const renderPeople = data => {
    let i = 1;
    for (let item of data) {
      // create full name
      let fullName = capitalizeFirstLetter(item.name.first) + ' ' + capitalizeFirstLetter(item.name.last);

      // our template
      let template = `<div class="item d-inline-block" data-id="${i}">
              <img src="${item.picture.large}" alt="${fullName}">
              <div class="price">0,3 ФМ</div>
            </div>`;

      // insert people
      peopleContainer.append(template);

      i++;
    }
  }

  /**
   * Represents a game.
   * @constructor
   * @param {number} round - The round of the game.
   */
  class Game {

    /**
     * Constructor.
     *
     * @param  {number} round - Rounds of the game.
     * @param  {number} attemptsNumber - How many times can user go wrong.
     */
    constructor(round, attemptsNumber) {
      this.round = round;
      this.attemptsNumber = attemptsNumber;
      this.answer;
    }

    /**
     * Starts round, set the correct answer.
     */
    startRound() {
      // generate and set the answer, only for demo!
      this.answer = randomNumber(1, 8);

      console.log(`Starting ${this.round} round, the answer is ${this.answer}.`)

      // update text
      roundNumber.text(this.round);

      // clear
      peopleContainer.empty();

      // get people
      $.ajax({
        url: 'https://randomuser.me/api/?results=8',
        dataType: 'json',
        success: (data) => {
          // render
          renderPeople(data.results);
        },
        error: (xhr, textStatus, error) => {
          console.log(xhr.responseText);
        }
      });

    }

    /**
     * Ends round, updates the progress bar.
     */
    endRound() {
      console.log(`Round ${this.round} completed.`)

      // update progress bar
      let point = this.round - 1;
      if (point >= 0) {
        // calc width for the bar
        let width = Math.round(100 / (totalRounds - 1) * point);
        progressBar.find('.active-line').animate({
          width: width + '%',
        }, 300, function() {
          progressBar.find('.point:eq(' + point + ')').addClass('active');
        });
      }

    }

    /**
     * Resets attempts counter.
     */
    resetCounter(intervalId) {
      clearInterval(intervalId);
      this.attemptsNumber = 3;
      attempts.text(3);
      attemptsLabel.text('ошибки');
      resultFalse.fadeOut('fast');
      peopleContainer.removeClass('false');
    }

    /**
     * Checks the answer and returs true/false.
     */
    checkAnswer(answer) {
      // give correct person
      let person = peopleContainer.find('.item[data-id="' + answer + '"]');

      // show messages
      if (answer === this.answer) {
        // update image
        let image = person.find('img').attr('src');
        resultTrue.find('img').attr('src', image);

        // show message
        resultTrue.fadeIn('fast');

        // and then hide
        setTimeout(() => {
          resultTrue.fadeOut('fast');
        }, 1000);
        return true;
      } else {
        // disable "wrong" person
        person.addClass('disabled');

        // decrease and update counter
        this.attemptsNumber--;
        attempts.text(this.attemptsNumber);
        if (this.attemptsNumber == 1) {
          attemptsLabel1.text('осталась');
          attemptsLabel.text('ошибка');
        } else if (this.attemptsNumber == 0) {
          attemptsLabel1.text('осталось');
          attemptsLabel.text('ошибок');
        } else {
          attemptsLabel1.text('осталось');
          attemptsLabel.text('ошибки');
        }

        // update counter if zero
        if (this.attemptsNumber == 0) {
          // start 10 sec timer
          const intervalId = animateCircleCountdown(10);
          resultFalse.fadeIn('fast');
          peopleContainer.addClass('false');

          // clear timer and counter
          const falseTimes = setTimeout(() => {
            this.resetCounter(intervalId);
          }, 10000);

          // skip button
          skipBtn.click(() => {
            clearTimeout(falseTimes);
            this.resetCounter(intervalId);
          });
        }
        return false;
      }
    }

    /**
     * Ends the game
     */
    endGame() {
      alert('Конец игры');
      location.reload();
    }

    set Round(value) {
      this.round = value;
    }

    get Round() {
      return this.round;
    }

  }

  /**
   * Run the code when page loaded
   */
  $(window).on('load', function() {

    // initialize the game
    const game = new Game(1, attemptsNumber);

    // start the first round
    game.startRound();

    // click on person
    peopleContainer.on('click', '.item:not(.disabled)', function() {
      let answer = $(this).data('id');

      // check answer and end round if true
      if (game.checkAnswer(answer) === true) {
        // end the current round
        game.endRound();

        // next round
        if (game.Round < totalRounds) {
          game.Round += 1;
          game.startRound();
        } else {
          // or end the game
          setTimeout(() => {
            game.endGame();
          }, 500);
        }
      }

    });

  });

})($);
