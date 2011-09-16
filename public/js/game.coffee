$(document).ready ->
  twpist = new Twpist
  $("a.btn.easy").click -> twpist.loadAssignment /[^ぁ-ん]+/g
  # $("a.btn.normal").click -> loadAssignment /[^ぁ-ん1-9]+/g
  # $("a.btn.hard").click -> loadAssignment /[^ぁ-ん1-9a-zA-Z]+/g

class Twpist
  loadAssignment: (regex)->
    @index = -1
    @count = 0
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
    @count++
    $("h2.left-time").text (140 - @count)
    @showResult() if @count is 140

  showResult: ->
    clearInterval(@timer)
    $("div.controller-container").hide()
    $("ul.timeline").hide()
    $(".result").show()
    $("ul.tabs li.timeline").removeClass "active"
    $("ul.tabs li.result").addClass "active"
    resultEjs = new EJS(url: "ejs/result_tweet.ejs")
    $("div.typing-container div.result").append resultEjs.render()
    tweetEjs = new EJS(url: "ejs/tweet.ejs")
    $("ul.result").append tweetEjs.render
      status: new ProxyStatus @allType + "文字", "img/icon.gif", "総入力文字数"
    $("ul.result").append tweetEjs.render
      status: new ProxyStatus @index + "ツイート", "img/icon.gif", "総入力ツイート数"
    $("ul.result").append tweetEjs.render
      status: new ProxyStatus (25600 / @allType).toFixed(3) + "秒", "img/icon.gif",
        "140文字打つのにかかる時間"
    $("ul.result").append tweetEjs.render
      status: new ProxyStatus (140 / @index).toFixed(3) + "秒/ツイート", "img/icon.gif", "平均ツイート時間"
    $("ul.result").append tweetEjs.render
      status: new ProxyStatus (650 * @index).toFixed(3)  + "ツイート", "img/icon.gif", "一日でツイートできる回数"


class ProxyStatus
  constructor: (@text, image, screen, name = screen)->
    @user =
      profile_image_url: image
      screen_name: screen
      name: name
