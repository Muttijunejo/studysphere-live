// StudySphere v2 — MCQ practice behaviour (no framework).
// Click an option to select it. "Show Answers" reveals the correct answers,
// marks your wrong picks, shows explanations and your score.
(function () {
  var body = document.body;
  var scoreLines = [document.getElementById('scoreLine'), document.getElementById('scoreLine2')];
  var toggleBtns = [document.getElementById('showAnswersBtn'), document.getElementById('showAnswersBtn2')];

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  each(document.querySelectorAll('.q'), function (q) {
    each(q.querySelectorAll('.opt'), function (opt) {
      opt.addEventListener('click', function () {
        each(q.querySelectorAll('.opt'), function (o) { o.classList.remove('selected', 'wrong'); });
        opt.classList.add('selected');
      });
    });
  });

  function setScore(text) {
    each(scoreLines, function (el) {
      if (!el) return;
      el.hidden = !text;
      el.textContent = text || '';
    });
  }

  function showAnswers(on) {
    body.classList.toggle('answers-on', on);
    var total = 0, correct = 0, attempted = 0;
    each(document.querySelectorAll('.q'), function (q) {
      total++;
      var answer = q.getAttribute('data-answer');
      var picked = q.querySelector('.opt.selected');
      each(q.querySelectorAll('.opt'), function (o) {
        o.classList.toggle('correct', o.getAttribute('data-letter') === answer);
        o.classList.remove('wrong');
      });
      if (picked) {
        attempted++;
        if (picked.getAttribute('data-letter') === answer) { correct++; }
        else { picked.classList.add('wrong'); }
      }
    });
    each(toggleBtns, function (b) { if (b) b.textContent = on ? 'Hide Answers' : 'Show Answers'; });
    if (on) {
      setScore('Score: ' + correct + ' / ' + total + '  (' + attempted + ' attempted)');
    } else {
      setScore('');
    }
  }

  each(toggleBtns, function (b) {
    if (b) b.addEventListener('click', function () { showAnswers(!body.classList.contains('answers-on')); });
  });

  var reset = document.getElementById('resetBtn');
  if (reset) reset.addEventListener('click', function () {
    each(document.querySelectorAll('.opt'), function (o) { o.classList.remove('selected', 'wrong', 'correct'); });
    showAnswers(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
