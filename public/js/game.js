var countUp, loadAssignment, prependTweet, setAssignment, showResult;
if (typeof twpist === "undefined" || twpist === null) {
  twpist = {};
}
twpist.timeline = null;
twpist.index = 0;
twpist.traverser = null;
twpist.count = 0;
setAssignment = function() {
  var status;
  $("div.typing-inputarea h2.fixed").text("");
  status = twpist.timeline[twpist.index];
  while (status.yomi.length === 0) {
    status = twpist.timeline[++twpist.index];
  }
  console.log(status.user.profile_image_url);
  $("div.typing-container img.icon").attr({
    src: status.user.profile_image_url
  });
  $("h2.typing-assignment").text(status.text);
  twpist.traverser = (new RomanizationGraph(status.yomi)).traverser();
  return $("div.typing-inputarea h2.input").text(twpist.traverser.decode());
};
prependTweet = function(status) {
  var tweet;
  tweet = $(new EJS({
    url: "ejs/tweet.ejs"
  }).render({
    status: status
  }));
  $("ul.timeline").prepend(tweet.hide());
  return tweet.show("slow");
};
countUp = function() {
  twpist.count++;
  if (twpist.count === 10) {
    return showResult();
  }
};
showResult = function() {
  $("div.controller-container").hide();
  $("ul.timeline").hide();
  $(".result").show();
  $("ul.tabs li.timeline").removeClass("active");
  $("ul.tabs li.result").addClass("active");
  $("div.typing-container div.result").append(new EJS({
    url: "ejs/result_tweet.ejs"
  }).render());
  return $("div.timeline-container div.result").append(new EJS({
    url: "ejs/result.ejs"
  }).render());
};
loadAssignment = function(regex) {
  $("div.level-container").hide("slow");
  $.get("/timeline.json", function(timeline) {
    var status, _i, _len;
    for (_i = 0, _len = timeline.length; _i < _len; _i++) {
      status = timeline[_i];
      status.yomi = status.yomi.replace(regex, "");
    }
    twpist.timeline = timeline.reverse();
    setAssignment();
    $("div.controller-container").show();
    $(document).keydown(function(event) {
      var chr, fixed;
      chr = String.fromCharCode(event.keyCode).toLowerCase();
      if (twpist.traverser.traverse(chr)) {
        fixed = $("div.typing-inputarea h2.fixed");
        fixed.text(twpist.traverser.getFixedText());
        fixed.scrollLeft(fixed.get(0).scrollWidth);
        $("div.typing-inputarea h2.input").text(twpist.traverser.decode());
        if (twpist.traverser.hasFinished()) {
          prependTweet(twpist.timeline[twpist.index]);
          twpist.index++;
          setAssignment();
        }
        return false;
      }
    });
    return setInterval(countUp, 1000);
  });
  return false;
};
$(document).ready(function() {
  return $("a.btn.easy").click(function() {
    return loadAssignment(/[^ぁ-ん]+/g);
  });
});