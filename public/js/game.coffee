twpist ?= {}
twpist.timeline = null
twpist.index = 0
twpist.traverser = null

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
  $("ul.timeline").prepend $("<li>").addClass("tweet").text(status.text)

$(document).ready ->
  $.get "/timeline.json", (timeline)->
    status.yomi = status.yomi.replace /[^ぁ-ん]+/g, "" for status in timeline
    twpist.timeline = timeline.reverse()
    setAssignment()
    false
  false

$(document).keydown (event)->
  chr = String.fromCharCode(event.keyCode).toLowerCase()
  if twpist.traverser.traverse chr
    fixed = $("div.typing-inputarea h2.fixed")
    fixed.text twpist.traverser.getFixedText()
    fixed.scrollLeft fixed.width()
    $("div.typing-inputarea h2.input").text twpist.traverser.decode()
    if twpist.traverser.hasFinished()
      prependTweet twpist.timeline[twpist.index]
      twpist.index++
      setAssignment()
      false
