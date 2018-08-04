// Generated by CoffeeScript 1.3.3
(function() {
  var ProxyStatus, Twpist, showResult, showTimeline, twpist,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  twpist = null;

  $(document).ready(function() {
    $("li.timeline a").click(showTimeline);
    $("li.result a").click(showResult);
    twpist = new Twpist(2);
    $("#level-easy").click(function() {
      twpist.level = 1;
      $("#level-buttons .primary").removeClass("primary");
      $(this).addClass("primary");
      return $("#level-description").html("ユーザー名(@)、ハッシュタグ(#)、URL、記号が除外された<br>ツイートが出題されます。");
    });
    $("#level-normal").click(function() {
      twpist.level = 2;
      $("#level-buttons .primary").removeClass("primary");
      $(this).addClass("primary");
      return $("#level-description").text("URL、記号が除外されたツイートが出題されます。");
    });
    $("#level-hard").click(function() {
      twpist.level = 3;
      $("#level-buttons .primary").removeClass("primary");
      $(this).addClass("primary");
      return $("#level-description").text("句読点(,.)以外の記号が除外されたツイートが出題されます。");
    });
    $("#start-button").click(function() {
      return twpist.loadAssignment();
    });
    false;
    return $("#tweet-button").click(function() {
      var traverser, typing;
      $(this).hide();
      $("#result-typing").removeClass("hidden");
      typing = $(new EJS({
        url: "ejs/problem.ejs"
      }).render({
        status: new ProxyStatus("タイピングして結果をツイート", "img/icon.gif", "結果")
      }));
      $("#result-typing").html(typing);
      traverser = new RomanizationGraph("たいぴんぐしてけっかをついーと").traverser();
      $("#problem-romaji").text(traverser.decode());
      $(document).unbind("keydown", twpist.keydownFunc);
      return $(document).keydown(function(event) {
        var chr;
        chr = (function() {
          switch (event.keyCode) {
            case 188:
              return ",";
            case 189:
            case 109:
            case 45:
            case 173:
              return "-";
            case 190:
              return ".";
            default:
              return String.fromCharCode(event.keyCode).toLowerCase();
          }
        })();
        if (traverser.traverse(chr)) {
          $("#problem-romaji").text(traverser.decode());
          if (traverser.hasFinished()) {
            $("#result-typing").remove();
            return window.open("https://twitter.com/intent/tweet?text=@" + $("input[name=screen_name]").val() + "さんのツイート速度は" + twpist.getTweetPerSecond() + "tweet/secで一日に最高" + twpist.getMaxTweetPerDay() + "ツイートできます。(レベル:" + twpist.getLevelStr() + ")" + "+%23twpist+http://twpist.com/");
          }
        } else {
          $("#result-typing").animate({
            left: "+=10px"
          }, 10);
          $("#result-typing").animate({
            left: "-=20px"
          }, 20);
          $("#result-typing").animate({
            left: "+=10px"
          }, 10);
          return false;
        }
      });
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
    $(".result").removeClass("hidden");
    $("ul.result").show();
    return $("ul.tabs li.result").addClass("active");
  };

  Twpist = (function() {

    function Twpist(level) {
      this.level = level;
      this.keydownFunc = __bind(this.keydownFunc, this);

    }

    Twpist.prototype.loadAssignment = function() {
      var _this = this;
      this.index = -1;
      this.allType = 0;
      $("div.level-container").hide("slow");
      return $.ajax({
        url: "/timeline.json",
        error: function(data) {
          return location.href = "/";
        },
        success: function(timeline) {
          var hashtag, lengthFilter, status, text, url, user, yomi, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;
          for (_i = 0, _len = timeline.length; _i < _len; _i++) {
            status = timeline[_i];
            yomi = status.yomi;
            text = status.text;
            if (_this.level < 3) {
              _ref = twttr.txt.extractUrls(yomi);
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                url = _ref[_j];
                yomi = yomi.replace(url, "");
                text = text.replace(url, "");
              }
            }
            if (_this.level < 2) {
              _ref1 = twttr.txt.extractHashtags(yomi);
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                hashtag = _ref1[_k];
                yomi = yomi.replace("#" + hashtag, "");
                text = text.replace("#" + hashtag, "");
              }
              _ref2 = twttr.txt.extractMentions(yomi);
              for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                user = _ref2[_l];
                yomi = yomi.replace("@" + user, "");
                text = text.replace("@" + user, "");
              }
            }
            if (_this.level === 3) {
              status.yomi = yomi.replace(/[^ぁ-ん0-9a-zA-Z,、.。ー-]+/g, "");
            } else {
              status.yomi = yomi.replace(/[^ぁ-ん0-9a-zA-Zー-]+/g, "");
            }
            status.text = text;
          }
          _this.timeline = timeline.sort(function(a, b) {
            return a.yomi.length - b.yomi.length;
          });
          lengthFilter = function(length) {
            var _this = this;
            return function(tweet) {
              return tweet.yomi.length > length;
            };
          };
          _this.timeline = (function() {
            switch (this.level) {
              case 2:
                return this.timeline.filter(lengthFilter(10));
              case 3:
                return this.timeline.filter(lengthFilter(30));
              default:
                return this.timeline;
            }
          }).call(_this);
          _this.nextAssignment();
          _this.endTime = new Date((new Date).getTime() + 140000);
          $("div.controller-container").show();
          $(document).keydown(_this.keydownFunc);
          return _this.timer = setInterval((function() {
            return _this.countDown();
          }), 100);
        }
      }, false);
    };

    Twpist.prototype.keydownFunc = function(event) {
      var chr, time, tweet;
      chr = (function() {
        switch (event.keyCode) {
          case 188:
            return ",";
          case 189:
          case 109:
          case 45:
          case 173:
            return "-";
          case 190:
            return ".";
          default:
            return String.fromCharCode(event.keyCode).toLowerCase();
        }
      })();
      if (this.traverser.traverse(chr)) {
        this.allType++;
        $("#problem-romaji").text(this.traverser.decode());
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
          return false;
        }
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
    };

    Twpist.prototype.nextAssignment = function() {
      var i, status, _i, _results;
      this.index++;
      while (this.timeline[this.index].yomi.length === 0) {
        this.index++;
      }
      status = this.timeline[this.index];
      this.traverser = new RomanizationGraph(status.yomi).traverser();
      this.startTime = new Date;
      $("#problem-container").html($(new EJS({
        url: "ejs/problem.ejs"
      }).render({
        status: this.timeline[this.index]
      })));
      $("#problem-romaji").text(this.traverser.decode());
      if (this.index - 1 >= 0) {
        $("div.img-container img.front").attr({
          src: this.timeline[this.index - 1].user.profile_image_url
        });
      }
      $("div.img-container img.pre1").attr({
        src: status.user.profile_image_url
      });
      _results = [];
      for (i = _i = 2; _i <= 9; i = ++_i) {
        _results.push($("div.img-container img.pre" + i).attr({
          src: this.timeline[this.index + i - 1].user.profile_image_url
        }));
      }
      return _results;
    };

    Twpist.prototype.countDown = function() {
      var leftTime;
      leftTime = Math.ceil((this.endTime - new Date) / 1000);
      $("#left-time").text(leftTime);
      if (leftTime < 0) {
        return this.result();
      }
    };

    Twpist.prototype.result = function() {
      var resultList, tweetEjs;
      clearInterval(this.timer);
      $("div.popover").remove();
      $("div.controller-container").hide();
      $("ul.tabs li.result").show();
      showResult();
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
        status: new ProxyStatus(this.getMaxTweetPerDay() + "ツイート", "img/icon.gif", "一日でツイートできる回数")
      }));
    };

    Twpist.prototype.getTweetPerSecond = function() {
      return (this.index / 140).toFixed(2);
    };

    Twpist.prototype.getMaxTweetPerDay = function() {
      return 650 * this.index;
    };

    Twpist.prototype.getLevelStr = function() {
      switch (this.level) {
        case 1:
          return "EASY";
        case 2:
          return "NORMAL";
        case 3:
          return "HARD";
        default:
          return "ERROR";
      }
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

}).call(this);
