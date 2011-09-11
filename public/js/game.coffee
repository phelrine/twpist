twpist ?= {}
twpist.timeline = null
twpist.index = 0
twpist.traverser = null

setAssignment = ->
  $("div.typing-inputarea h2.fixed").text ""
  status = twpist.timeline[twpist.index]
  while status.length == 0
    twpist.index++
    status = twpist.timeline[twpist.index]

  twpist.index++ if status is ""
  $("h2.typing-assignment").text status.text
  twpist.traverser = (new RomanizationGraph status.yomi).traverser()
  $("div.typing-inputarea h2.input").text twpist.traverser.decode()

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
    $("div.typing-inputarea h2.fixed").text twpist.traverser.getFixedText()
    $("div.typing-inputarea h2.input").text twpist.traverser.decode()
    if twpist.traverser.hasFinished()
      twpist.index++
      setAssignment()
      false
