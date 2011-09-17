var ProxyStatus, Twpist, showResult, showTimeline;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(document).ready(function() {
  var twpist;
  $("li.timeline a").click(showTimeline);
  $("li.result a").click(showResult);
  twpist = new Twpist;
  return $("a.btn.easy").click(function() {
    return twpist.loadAssignment(/[^ぁ-ん]+/g);
  });
});
showTimeline = function() {
  $("ul.result").hide();
  $("ul.tabs .active").removeClass("active");
  $("ul.timeline").show();
  return $("ul.tabs li.timeline").addClass("active");
};
showResult = function() {
  $("ul.timeline").hide();
  $("ul.tabs .active").removeClass("active");
  $("ul.result").show();
  return $("ul.tabs li.result").addClass("active");
};
Twpist = (function() {
  function Twpist() {}
  Twpist.prototype.loadAssignment = function(regex) {
    this.index = -1;
    this.count = 140;
    this.allType = 0;
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
        var chr, fixed, time, tweet;
        chr = String.fromCharCode(event.keyCode).toLowerCase();
        if (this.traverser.traverse(chr)) {
          this.allType++;
          fixed = $("div.typing-inputarea h2.fixed");
          fixed.text(this.traverser.getFixedText());
          fixed.scrollLeft(fixed.get(0).scrollWidth);
          $("div.typing-inputarea h2.input").text(this.traverser.decode());
          if (this.traverser.hasFinished()) {
            time = new Date() - this.startTime;
            tweet = $(new EJS({
              url: "ejs/tweet.ejs"
            }).render({
              status: this.timeline[this.index],
              time: time
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
    while (this.timeline[this.index].yomi.length === 0) {
      this.index++;
    }
    status = this.timeline[this.index];
    this.traverser = new RomanizationGraph(status.yomi).traverser();
    this.startTime = new Date;
    $("div.typing-inputarea h2.fixed").text("");
    $("div.typing-container img.icon").attr({
      src: status.user.profile_image_url
    });
    $("h2.typing-assignment").text(status.text);
    return $("div.typing-inputarea h2.input").text(this.traverser.decode());
  };
  Twpist.prototype.countUp = function() {
    this.count--;
    $("h2.left-time").text(this.count);
    if (this.count === 0) {
      return this.result();
    }
  };
  Twpist.prototype.result = function() {
    var resultEjs, resultList, tweetEjs;
    clearInterval(this.timer);
    $("div.controller-container").hide();
    $("ul.tabs li.result").show();
    showResult();
    resultEjs = new EJS({
      url: "ejs/result_tweet.ejs"
    });
    $("div.typing-container div.result").append(resultEjs.render());
    tweetEjs = new EJS({
      url: "ejs/tweet.ejs"
    });
    resultList = $("ul.result");
    resultList.append(tweetEjs.render({
      status: new ProxyStatus(this.allType + "文字", "img/icon.gif", "総入力文字数")
    }));
    resultList.append(tweetEjs.render({
      status: new ProxyStatus(this.index + "ツイート", "img/icon.gif", "総入力ツイート数")
    }));
    resultList.append(tweetEjs.render({
      status: new ProxyStatus((25600 / this.allType).toFixed(3) + "秒", "img/icon.gif", "140文字打つのにかかる時間")
    }));
    resultList.append(tweetEjs.render({
      status: new ProxyStatus((140 / this.index).toFixed(3) + "秒/ツイート", "img/icon.gif", "平均ツイート時間")
    }));
    return resultList.append(tweetEjs.render({
      status: new ProxyStatus(650 * this.index + "ツイート", "img/icon.gif", "一日でツイートできる回数")
    }));
  };
  return Twpist;
})();
ProxyStatus = (function() {
  function ProxyStatus(text, image, screen, name) {
    this.text = text;
    if (name == null) {
      name = screen;
    }
    this.user = {
      profile_image_url: image,
      screen_name: screen,
      name: name
    };
  }
  return ProxyStatus;
})();