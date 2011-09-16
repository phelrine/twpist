$(document).ready ->
  twpist = new Twpist
  $("a.btn.easy").click -> twpist.loadAssignment /[^ぁ-ん]+/g
  # $("a.btn.normal").click -> loadAssignment /[^ぁ-ん1-9]+/g
  # $("a.btn.hard").click -> loadAssignment /[^ぁ-ん1-9a-zA-Z]+/g

class Twpist
  loadAssignment: (regex)->
    @index = -1
    @count = 0
    $("div.level-container").hide "slow"

    $.get "/timeline.json", (timeline)=>
      status.yomi = status.yomi.replace regex, "" for status in timeline
      @timeline = timeline.reverse()
      @nextAssignment()

      $("div.controller-container").show()

      $(document).keydown (event)=>
        chr = String.fromCharCode(event.keyCode).toLowerCase()
        if @traverser.traverse chr
          fixed = $("div.typing-inputarea h2.fixed")
          fixed.text @traverser.getFixedText()
          fixed.scrollLeft fixed.get(0).scrollWidth
          $("div.typing-inputarea h2.input").text @traverser.decode()
          if @traverser.hasFinished()
            tweet = $(new EJS(url: "ejs/tweet.ejs").render(status: @timeline[@index]))
            $("ul.timeline").prepend tweet.hide()
            tweet.show "slow"
            @nextAssignment()
          false

      @timer = setInterval((=> @countUp()), 1000)
    false

  nextAssignment: ->
    @index++
    console.log @index
    @index++ while @timeline[@index].yomi.length is 0
    status = @timeline[@index]
    @traverser = new RomanizationGraph(status.yomi).traverser()

    $("div.typing-inputarea h2.fixed").text ""
    $("div.typing-container img.icon").attr src: status.user.profile_image_url
    $("h2.typing-assignment").text status.text
    $("div.typing-inputarea h2.input").text @traverser.decode()

  countUp: ->
    @count++
    $("h2.left-time").text (140 - @count)
    @showResult() if @count is 140

  showResult: ->
    console.log "show"
    clearInterval(@timer)
    $("div.controller-container").hide()
    $("ul.timeline").hide()
    $(".result").show()
    $("ul.tabs li.timeline").removeClass "active"
    $("ul.tabs li.result").addClass "active"
    $("div.typing-container div.result").append new EJS(url: "ejs/result_tweet.ejs").render()
