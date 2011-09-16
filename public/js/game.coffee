twpist ?= {}
twpist.timeline = null
twpist.index = 0
twpist.traverser = null
twpist.count = 0

setAssignment = ->
  $("div.typing-inputarea h2.fixed").text ""
  status = twpist.timeline[twpist.index]
  status = twpist.timeline[++twpist.index] while status.yomi.length is 0
  console.log status.user.profile_image_url
  $("div.typing-container img.icon").attr src: status.user.profile_image_url
  $("h2.typing-assignment").text status.text
  twpist.traverser = (new RomanizationGraph status.yomi).traverser()
  $("div.typing-inputarea h2.input").text twpist.traverser.decode()

prependTweet = (status) ->
  tweet = $(new EJS(url: "ejs/tweet.ejs").render(status: status))
  $("ul.timeline").prepend tweet.hide()
  tweet.show "slow"

countUp = ()->
  twpist.count++
  if twpist.count is 10
    showResult()

showResult = ()->
  $("div.controller-container").hide()
  $("ul.timeline").hide()
  $(".result").show()
  $("ul.tabs li.timeline").removeClass "active"
  $("ul.tabs li.result").addClass "active"
  $("div.typing-container div.result").append new EJS(url: "ejs/result_tweet.ejs").render()
  $("div.timeline-container div.result").append new EJS(url: "ejs/result.ejs").render()
loadAssignment = (regex)->
  $("div.level-container").hide "slow"
  $.get "/timeline.json", (timeline)->
    status.yomi = status.yomi.replace regex, "" for status in timeline
    twpist.timeline = timeline.reverse()
    setAssignment()
    $("div.controller-container").show()

    $(document).keydown (event)->
      chr = String.fromCharCode(event.keyCode).toLowerCase()
      if twpist.traverser.traverse chr
        fixed = $("div.typing-inputarea h2.fixed")
        fixed.text twpist.traverser.getFixedText()
        fixed.scrollLeft fixed.get(0).scrollWidth
        $("div.typing-inputarea h2.input").text twpist.traverser.decode()
        if twpist.traverser.hasFinished()
          prependTweet twpist.timeline[twpist.index]
          twpist.index++
          setAssignment()
        false

    setInterval(countUp, 1000)
  false

$(document).ready ->
  $("a.btn.easy").click -> loadAssignment /[^ぁ-ん]+/g
  # $("a.btn.normal").click -> loadAssignment /[^ぁ-ん1-9]+/g
  # $("a.btn.hard").click -> loadAssignment /[^ぁ-ん1-9a-zA-Z]+/g
  # loadAssignment /[^ぁ-ん]+/g
