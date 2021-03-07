/*
 * every jQuery plugin for "typewriter" effect totally sucked
   so I hacked something together.

   Then I got a lot of interview questions about when a good time
   to use javascript closures is, and I kept coming back to this
   example; so I generalized it into a proper jQuery plugin.

   Feedback appreciated.
*/

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

(function ( $ ) {
    $.fn.typewrite = function ( options ) {
        var settings = {
            'selector': this,
            'extra_char': '',
            'delay':    100,
            'trim':     false,
            'callback': null
        };
        if (options) $.extend(settings, options);

        /* This extra closure makes it so each element
         * matched by the selector runs sequentially, instead
         * of all at the same time. */
        function type_next_element(index) {
            var current_element = $(settings.selector[index]);
            var final_text = current_element.text();
            if (settings.trim) final_text = $.trim(final_text);
            current_element.html("").show();

            function type_next_character(element, i) {
                element.html( final_text.substr(0, i)+settings.extra_char );
                if (final_text.length >= i) {
                    setTimeout(function() {
                        type_next_character(element, i+1);
                    }, settings.delay);
                }
                else {
                    if (++index < settings.selector.length) {
                        type_next_element(index);
                    }
                    else if (settings.callback) settings.callback();
                }
            }
            type_next_character(current_element, 0);
        }
        type_next_element(0);

        return this;
    };
})(jQuery);

// example: $('.someclass').typewrite();

$(document).ready(function() {
    $('.type').typewrite({
        'delay': 50
    });
});

var cards = [
"You are a therapist and this is your patient.",
"This conversation is being broadcast live on the radio.",
"You suspect the person you are talking to is an alien impersonating a human.",
"You are madly in love with this person.",
"This is a job interview.",
"You are hard of hearing and answering questions based off of educated guesses as to what the other person is saying.",
"You are trying to imitate the other person’s mannerisms.",
"You are an alien impersonating a human.",
"You are trying to sell the other person liquid soap, and are using as many opportunities to explain the benefits of liquid soap as possible.",
"Everything you say must be dishonest, but try to make it sound true.",
"Everything you say must be an obvious lie.",
"You mustn’t use the letter &ldquo;e&rdquo;",
"Everything this person says or does, try to say or do better",
"You honestly have never heard of anything this person mentions.",
"You’re intoxicated and trying to hide this fact.",
"You really have to pee and are just trying to get this over with.",
"The other person is a four-year-old and you’re acting interested and proud.",
"Argue with everything this person says.",
"You’re a four-year-old.",
"You’re auditioning for a high-school play. Everything the other person says is a line that you should perform as dramatically and loudly as possible.",
"The person you’re talking to is your best friend Jack. He’s messing with you and it’s not funny anymore. Plee for him to stop messing with you.",
"You are a spy and you’re being fed lines but the people feeding you lines are incompetent and hard to hear.",
"This conversation is really about drugs and everything is just code for drugs.",
"Explain to the other person why their behaviour is hurtful to you.",
"There is a barely audible sound that keeps going off when you start talking.",
"Just be yourself.",
"Tell this person your deepest and darkest thoughts.",
"You’re an instagram celebrity that is getting increasingly frustrated that you’re not getting special treatment.",
"You are the good cop in a good cop/bad cop style interrogation",
"Be an asshole",
"You are an actor and this is a scene in a movie. This is the 87th take, and you are sick of every part of this.",
"Try and get the other person to say the word &ldquo;spoon&rdquo; without saying it yourself.",
"This is a cheesy porno",
"Only ask questions.",
"Try and be as helpful as possible.",
"You are hoping to make a marriage proposal, but are very nervous.",
"You know that there are roughly 20 people hiding in this room, and in about 30 seconds they will jump out of hiding and yell “surprise!”",
"Explain to the other person why they need to start being less selfish during sex.",
"You’re in a library and need to keep the volume down.",
"Explain world war two (a subject you a both very knowledgeable on and passionate about)",
"Confront the other person about their drinking problem.",
"Keep making freudian slips.",
"The cops are coming soon and you need this other person to act cool when they arrive.",
"No matter what the other person says, just sigh and say &ldquo;that’s heavy man.&rdquo;",
"The other person is a waiter at a restaurant who has mistakenly brought you a steak you didn’t order for the 11th time in a row.",
"The other person is your pet down who has escaped.",
"You’re an immature middle school boy.",
"You’re a malfunctioning robot.",
"You’re very sad about your recent break up with your boyfriend Josh, and everything the other person says reminds you of him.",
"This is a medieval interrogation.",
"You don’t remember who the other person is or how to know them, but are too embarrassed to ask.",
"The other person is a figment of your imagination.",
"The other person is God, and everything they say is true and wise.",
"You have poisoned the other person and are starting to wonder why they haven't died yet.",
"You’re an evil mastermind.",
"Plead with this person to take you back as a lover. You will be better this time around.",
"You're being hypnotized.",
"Interpret everything as a sly inside joke.",
"You cannot speak or make sound. Only communicate using hand gestures.",
"Try to actually hurt the other person."];

var i = 0;
var ti = 0;

function card5(number) {
  shuffle(cards);
  cards[number] = "That's the end of the game. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Do you want to review any cards?";
  document.getElementById('card5').innerHTML = cards[i];
  document.getElementById('number').innerHTML = "1)";
  $('.card5').typewrite({
      'delay': 35
  });
  const interval2 = setInterval(function() {
    ti = ti + 3.333333333;
    document.getElementById('timer').style = "width: " + ti + "vw;";
 }, 1166.666666667);
  const interval = setInterval(function() {
    ti = 0;
    document.getElementById('timer').style = "width: " + ti + "vw;";
    i = i + 1;
   document.getElementById('card5').innerHTML = cards[i];
   document.getElementById('number').innerHTML = (i + 1) + ")";
   $('.card5').typewrite({
       'delay': 35
   });
   if (i==number){
     clearInterval(interval);
     clearInterval(interval2);
     document.getElementById('number').style = "color: white;";
     document.getElementById('timer').style = "background-color: white;";
     setTimeout(function () {
         $('.type2').typewrite({
          'delay': 50
         });
    }, 4000);
   }
 }, 35000);
}

function review(i) {
  document.getElementById('number').style = "color: black;";
  document.getElementById('number').innerHTML = i + ")";
  document.getElementById('card5').innerHTML = cards[(i-1)];
}
