var prependTweet, setAssignment;
if (typeof twpist === "undefined" || twpist === null) {
  twpist = {};
}
twpist.timeline = null;
twpist.index = 0;
twpist.traverser = null;
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
  return $("ul.timeline").prepend($("<li>").addClass("tweet").append($("<img>").attr({
    src: status.user.profile_image_url
  })).append($("<p>").text(status.text)));
};
$(document).ready(function() {
  $.get("/timeline.json", function(timeline) {
    var status, _i, _len;
    for (_i = 0, _len = timeline.length; _i < _len; _i++) {
      status = timeline[_i];
      status.yomi = status.yomi.replace(/[^ぁ-ん]+/g, "");
    }
    twpist.timeline = timeline.reverse();
    setAssignment();
    return false;
  });
  return false;
});
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
      return false;
    }
  }
});