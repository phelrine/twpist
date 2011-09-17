$(document).ready ->
  $("li.timeline a").click showTimeline
  $("li.result a").click showResult
  twpist = new Twpist
  $("a.btn.easy").click -> twpist.loadAssignment /[^ぁ-ん]+/g
  # $("a.btn.normal").click -> loadAssignment /[^ぁ-ん1-9]+/g
  # $("a.btn.hard").click -> loadAssignment /[^ぁ-ん1-9a-zA-Z]+/g

  $("a.logout").click ->
    $.post "/logout", -> location.href = "/"
  false

showTimeline = ->
  $("ul.result").hide()
  $("ul.tabs .active").removeClass "active"

  $("ul.timeline").show()
  $("ul.tabs li.timeline").addClass "active"

showResult = ->
  $("ul.timeline").hide()
  $("ul.tabs .active").removeClass "active"

  $("ul.result").show()
  $("ul.tabs li.result").addClass "active"

class Twpist
  loadAssignment: (regex)->
    @index = -1
    @count = 140
    @allType = 0
    $("div.level-container").hide "slow"

    $.get "/timeline.json", (timeline)=>
      status.yomi = status.yomi.replace regex, "" for status in timeline
      @timeline = timeline.reverse()
      @nextAssignment()

      $("div.controller-container").show()

      $(document).keydown (event)=>
        chr = String.fromCharCode(event.keyCode).toLowerCase()
        if @traverser.traverse chr
          @allType++
          fixed = $("div.typing-inputarea h2.fixed")
          fixed.text @traverser.getFixedText()
          fixed.scrollLeft fixed.get(0).scrollWidth
          $("div.typing-inputarea h2.input").text @traverser.decode()
          if @traverser.hasFinished()
            time = new Date() - @startTime
            tweet = $(new EJS(url: "ejs/tweet.ejs").render(status: @timeline[@index], time: time))
            $("ul.timeline").prepend tweet.hide()
            tweet.show "slow"
            @nextAssignment()
          false

      @timer = setInterval((=> @countUp()), 1000)
    false

  nextAssignment: ->
    @index++
    @index++ while @timeline[@index].yomi.length is 0
    status = @timeline[@index]
    @traverser = new RomanizationGraph(status.yomi).traverser()
    @startTime = new Date
    $("div.typing-inputarea h2.fixed").text ""
    $("div.typing-container img.icon").attr src: status.user.profile_image_url
    $("h2.typing-assignment").text status.text
    $("div.typing-inputarea h2.input").text @traverser.decode()

  countUp: ->
    @count--
    $("h2.left-time").text @count
    @result() if @count is 0

  result: ->
    clearInterval(@timer)
    $("div.controller-container").hide()
    $("ul.tabs li.result").show()
    showResult()

    resultEjs = new EJS(url: "ejs/result_tweet.ejs")
    $("div.typing-container div.result").append resultEjs.render()
    tweetEjs = new EJS(url: "ejs/tweet.ejs")
    resultList = $("ul.result")
    resultList.append tweetEjs.render
      status: new ProxyStatus @allType + "文字", "img/icon.gif", "総入力文字数"
    resultList.append tweetEjs.render
      status: new ProxyStatus @index + "ツイート", "img/icon.gif", "総入力ツイート数"
    resultList.append tweetEjs.render
      status: new ProxyStatus (25600 / @allType).toFixed(3) + "秒", "img/icon.gif", "140文字打つのにかかる時間"
    resultList.append tweetEjs.render
      status: new ProxyStatus (140 / @index).toFixed(3) + "秒/ツイート", "img/icon.gif", "平均ツイート時間"
    resultList.append tweetEjs.render
      status: new ProxyStatus 650 * @index  + "ツイート", "img/icon.gif", "一日でツイートできる回数"


class ProxyStatus
  constructor: (@text, image, screen, name = screen)->
    @user =
      profile_image_url: image
      screen_name: screen
      name: name
