var ProxyStatus, Twpist, showResult, showTimeline, twpist;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
twpist = null;
$(document).ready(function() {
  var level;
  $("li.timeline a").click(showTimeline);
  $("li.result a").click(showResult);
  twpist = new Twpist;
  level = 2;
  $("#level-easy").click(function() {
    level = 1;
    $("#level-buttons .primary").removeClass("primary");
    $(this).addClass("primary");
    return $("#level-description").html("ユーザー名(@)、ハッシュタグ(#)、URL、記号が除外された<br>ツイートが出題されます。");
  });
  $("#level-normal").click(function() {
    level = 2;
    $("#level-buttons .primary").removeClass("primary");
    $(this).addClass("primary");
    return $("#level-description").text("URL、記号が除外されたツイートが出題されます。");
  });
  $("#level-hard").click(function() {
    level = 3;
    $("#level-buttons .primary").removeClass("primary");
    $(this).addClass("primary");
    return $("#level-description").text("句読点(,.)以外の記号が除外されたツイートが出題されます。");
  });
  $("#start-button").click(function() {
    return twpist.loadAssignment(level);
  });
  $("a.logout").click(function() {
    return $.post("/logout", function() {
      return location.href = "/";
    });
  });
  false;
  return $("#tweet-button").click(function() {
    var typeToTweet;
    typeToTweet = new RomanizationGraph("たいぴんぐしてけっかをついーと").traverser();
    return $(document).keydown(__bind(function(event) {}, this));
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
  Twpist.prototype.loadAssignment = function(level) {
    this.index = -1;
    this.count = 140;
    this.allType = 0;
    $("div.level-container").hide("slow");
    $.get("/timeline.json", __bind(function(timeline) {
      var hashtag, lengthFilter, status, text, url, user, yomi, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3;
      for (_i = 0, _len = timeline.length; _i < _len; _i++) {
        status = timeline[_i];
        yomi = status.yomi;
        text = status.text;
        if (level < 3) {
          _ref = twttr.txt.extractUrls(yomi);
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            url = _ref[_j];
            yomi = yomi.replace(url, "");
            text = text.replace(url, "");
          }
        }
        if (level < 2) {
          _ref2 = twttr.txt.extractHashtags(yomi);
          for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
            hashtag = _ref2[_k];
            yomi = yomi.replace("#" + hashtag, "");
            text = text.replace("#" + hashtag, "");
          }
          _ref3 = twttr.txt.extractMentions(yomi);
          for (_l = 0, _len4 = _ref3.length; _l < _len4; _l++) {
            user = _ref3[_l];
            yomi = yomi.replace("@" + user, "");
            text = text.replace("@" + user, "");
          }
        }
        if (level === 3) {
          status.yomi = yomi.replace(/[^ぁ-ん0-9a-zA-Z,、.。ー-]+/g, "");
        } else {
          status.yomi = yomi.replace(/[^ぁ-ん0-9a-zA-Zー-]+/g, "");
        }
        status.text = text;
      }
      this.timeline = timeline.sort(function(a, b) {
        return a.yomi.length - b.yomi.length;
      });
      lengthFilter = function(length) {
        return __bind(function(tweet) {
          return tweet.yomi.length > length;
        }, this);
      };
      this.timeline = (function() {
        switch (level) {
          case 2:
            return this.timeline.filter(lengthFilter(10));
          case 3:
            return this.timeline.filter(lengthFilter(30));
          default:
            return this.timeline;
        }
      }).call(this);
      this.nextAssignment();
      $("div.controller-container").show();
      $(document).keydown(__bind(function(event) {
        var chr, fixed, time, tweet;
        chr = (function() {
          switch (event.keyCode) {
            case 188:
              return ",";
            case 189:
            case 109:
              return "-";
            case 190:
              return ".";
            default:
              return String.fromCharCode(event.keyCode).toLowerCase();
          }
        })();
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
            $("div.img-container img.front").show();
            $("div.img-container img.pre9").hide();
            $("div.img-container img.front").hide("normal");
            $("div.img-container img.pre9").show("slow");
            this.nextAssignment();
          }
          return false;
        } else {
          $("div.popover").animate({
            left: "+=10px"
          }, 10);
          $("div.popover").animate({
            left: "-=20px"
          }, 20);
          return $("div.popover").animate({
            left: "+=10px"
          }, 10);
        }
      }, this));
      return this.timer = setInterval((__bind(function() {
        return this.countUp();
      }, this)), 1000);
    }, this));
    return false;
  };
  Twpist.prototype.nextAssignment = function() {
    var i, name, status, _results;
    this.index++;
    while (this.timeline[this.index].yomi.length === 0) {
      this.index++;
    }
    status = this.timeline[this.index];
    this.traverser = new RomanizationGraph(status.yomi).traverser();
    this.startTime = new Date;
    name = $(new EJS({
      url: "ejs/assignment-head.ejs"
    }).render({
      status: this.timeline[this.index]
    }));
    $("div.assignment-head").html(name);
    $("div.typing-inputarea h2.fixed").text("");
    $("h2.typing-assignment").text(status.text);
    $("div.typing-inputarea h2.input").text(this.traverser.decode());
    if (this.index - 1 >= 0) {
      $("div.img-container img.front").attr({
        src: this.timeline[this.index - 1].user.profile_image_url
      });
    }
    $("div.img-container img.pre1").attr({
      src: status.user.profile_image_url
    });
    _results = [];
    for (i = 2; i <= 9; i++) {
      _results.push($("div.img-container img.pre" + i).attr({
        src: this.timeline[this.index + i - 1].user.profile_image_url
      }));
    }
    return _results;
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