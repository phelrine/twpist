var Twpist;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  var twpist;
  twpist = new Twpist;
  return $("a.btn.easy").click(function() {
    return twpist.loadAssignment(/[^ぁ-ん]+/g);
  });
});
Twpist = (function() {
  function Twpist() {}
  Twpist.prototype.loadAssignment = function(regex) {
    this.index = -1;
    this.count = 0;
    $("div.level-container").hide("slow");
    $.get("/timeline.json", __bind(function(timeline) {
      var status, _i, _len;
      for (_i = 0, _len = timeline.length; _i < _len; _i++) {
        status = timeline[_i];
        status.yomi = status.yomi.replace(regex, "");
      }
      this.timeline = timeline.reverse();
      this.nextAssignment();
      $("div.controller-container").show();
      $(document).keydown(__bind(function(event) {
        var chr, fixed, tweet;
        chr = String.fromCharCode(event.keyCode).toLowerCase();
        if (this.traverser.traverse(chr)) {
          fixed = $("div.typing-inputarea h2.fixed");
          fixed.text(this.traverser.getFixedText());
          fixed.scrollLeft(fixed.get(0).scrollWidth);
          $("div.typing-inputarea h2.input").text(this.traverser.decode());
          if (this.traverser.hasFinished()) {
            tweet = $(new EJS({
              url: "ejs/tweet.ejs"
            }).render({
              status: this.timeline[this.index]
            }));
            $("ul.timeline").prepend(tweet.hide());
            tweet.show("slow");
            this.nextAssignment();
          }
          return false;
        }
      }, this));
      return this.timer = setInterval((__bind(function() {
        return this.countUp();
      }, this)), 1000);
    }, this));
    return false;
  };
  Twpist.prototype.nextAssignment = function() {
    var status;
    this.index++;
    console.log(this.index);
    while (this.timeline[this.index].yomi.length === 0) {
      this.index++;
    }
    status = this.timeline[this.index];
    this.traverser = new RomanizationGraph(status.yomi).traverser();
    $("div.typing-inputarea h2.fixed").text("");
    $("div.typing-container img.icon").attr({
      src: status.user.profile_image_url
    });
    $("h2.typing-assignment").text(status.text);
    return $("div.typing-inputarea h2.input").text(this.traverser.decode());
  };
  Twpist.prototype.countUp = function() {
    this.count++;
    $("h2.left-time").text(140 - this.count);
    if (this.count === 140) {
      return this.showResult();
    }
  };
  Twpist.prototype.showResult = function() {
    console.log("show");
    clearInterval(this.timer);
    $("div.controller-container").hide();
    $("ul.timeline").hide();
    $(".result").show();
    $("ul.tabs li.timeline").removeClass("active");
    $("ul.tabs li.result").addClass("active");
    return $("div.typing-container div.result").append(new EJS({
      url: "ejs/result_tweet.ejs"
    }).render());
  };
  return Twpist;
})();