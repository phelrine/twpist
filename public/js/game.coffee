twpist = null

$(document).ready ->
  $("li.timeline a").click showTimeline
  $("li.result a").click showResult
  twpist = new Twpist(2)
  $("#level-easy").click ->
    twpist.level = 1
    $("#level-buttons .primary").removeClass("primary")
    $(@).addClass("primary")
    $("#level-description").html("ユーザー名(@)、ハッシュタグ(#)、URL、記号が除外された<br>ツイートが出題されます。")
  $("#level-normal").click ->
    twpist.level = 2
    $("#level-buttons .primary").removeClass("primary")
    $(@).addClass("primary")
    $("#level-description").text("URL、記号が除外されたツイートが出題されます。")
  $("#level-hard").click ->
    twpist.level = 3
    $("#level-buttons .primary").removeClass("primary")
    $(@).addClass("primary")
    $("#level-description").text("句読点(,.)以外の記号が除外されたツイートが出題されます。")

  $("#start-button").click ->
    twpist.loadAssignment()
  $("a.logout").click ->
    $.post "/logout", -> location.href = "/"
  false

  $("#tweet-button").click ->
    $(@).hide()
    $("#result-typing").removeClass "hidden"
    typing = $(new EJS(url: "ejs/problem.ejs").render(status: new ProxyStatus "タイピングして結果をツイート", "img/icon.gif", "結果"))
    $("#result-typing").html typing
    traverser = new RomanizationGraph("たいぴんぐしてけっかをついーと").traverser()
    $("#problem-romaji").text traverser.decode()
    $(document).keydown (event) ->
      chr = switch event.keyCode
        when 188 then ","
        when 189, 109 then "-"
        when 190 then "."
        else String.fromCharCode(event.keyCode).toLowerCase()
      if traverser.traverse chr
        $("#problem-romaji").text traverser.decode()
        if traverser.hasFinished()
          location.href = "https://twitter.com/intent/tweet?text=" + "さんのツイート速度は" +
            twpist.getTweetPerSecond() + "tweet/secで一日に最高" + twpist.getMaxTweetPerDay() + "ツイートできます。+%23twpist+http://twpist.com/"
      else
        $("#result-typing").animate left: "+=10px", 10
        $("#result-typing").animate left: "-=20px", 20
        $("#result-typing").animate left: "+=10px", 10
        false

showTimeline = ->
  $("ul.result").hide()
  $("ul.tabs .active").removeClass "active"

  $("ul.timeline").show()
  $("ul.tabs li.timeline").addClass "active"

showResult = ->
  $("ul.timeline").hide()
  $("ul.tabs .active").removeClass "active"

  $(".result").removeClass "hidden"
  $("ul.tabs li.result").addClass "active"

class Twpist
  constructor: (@level)->
  loadAssignment: ->
    @index = -1
    @count = 140
    @allType = 0
    $("div.level-container").hide "slow"

    $.get "/timeline.json", (timeline)=>
      for status in timeline
        yomi = status.yomi
        text = status.text
        if @level < 3
          for url in twttr.txt.extractUrls(yomi)
            yomi = yomi.replace url, ""
            text = text.replace url, ""

        if @level < 2
          for hashtag in twttr.txt.extractHashtags(yomi)
            yomi = yomi.replace "##{hashtag}", ""
            text = text.replace "##{hashtag}", ""
          for user in twttr.txt.extractMentions(yomi)
            yomi = yomi.replace "@#{user}", ""
            text = text.replace "@#{user}", ""

        if @level is 3
          status.yomi = yomi.replace /[^ぁ-ん0-9a-zA-Z,、.。ー-]+/g, ""
        else
          status.yomi = yomi.replace /[^ぁ-ん0-9a-zA-Zー-]+/g, ""

        status.text = text
      @timeline = timeline.sort (a, b)-> a.yomi.length - b.yomi.length
      lengthFilter = (length) -> (tweet)=> tweet.yomi.length > length
      @timeline = switch(@level)
        when 2 then @timeline.filter lengthFilter(10)
        when 3 then @timeline.filter lengthFilter(30)
        else @timeline

      @nextAssignment()

      $("div.controller-container").show()

      $(document).keydown (event)=> @keydownFunc(event)
      @timer = setInterval((=> @countUp()), 1000)
    false

  keydownFunc: (event)->
    # console.log event.keyCode
    chr = switch event.keyCode
      when 188 then ","
      when 189, 109 then "-"
      when 190 then "."
      else String.fromCharCode(event.keyCode).toLowerCase()
    if @traverser.traverse chr
      @allType++
      $("#problem-romaji").text @traverser.decode()
      if @traverser.hasFinished()
        time = new Date() - @startTime
        tweet = $(new EJS(url: "ejs/tweet.ejs").render(status: @timeline[@index], time: time))
        $("ul.timeline").prepend tweet.hide()
        tweet.show "slow"
        $("div.img-container img.front").show()
        $("div.img-container img.pre9").hide()
        $("div.img-container img.front").hide "normal"
        $("div.img-container img.pre9").show "slow"
        @nextAssignment()
        false
    else
       $("div.popover").animate left: "+=10px", 10
       $("div.popover").animate left: "-=20px", 20
       $("div.popover").animate left: "+=10px", 10


  nextAssignment: ->
    @index++
    @index++ while @timeline[@index].yomi.length is 0
    status = @timeline[@index]
    @traverser = new RomanizationGraph(status.yomi).traverser()
    @startTime = new Date
    $("#problem-container").html $(new EJS(url: "ejs/problem.ejs").render(status: @timeline[@index]))
    $("#problem-romaji").text @traverser.decode()
    if @index-1 >= 0
      $("div.img-container img.front").attr src: @timeline[@index-1].user.profile_image_url
    $("div.img-container img.pre1").attr src: status.user.profile_image_url
    for i in [2..9]
      $("div.img-container img.pre#{i}").attr src: @timeline[@index+i-1].user.profile_image_url

  countUp: ->
    @count--
    $("#left-time").text @count
    @result() if @count is 0

  result: ->
    clearInterval(@timer)
    $("div.popover").remove()
    $("div.controller-container").hide()
    $("ul.tabs li.result").show()
    showResult()
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
      status: new ProxyStatus @getMaxTweetPerDay()  + "ツイート", "img/icon.gif", "一日でツイートできる回数"

  getTweetPerSecond: ->
    (@index / 140).toFixed(2)

  getMaxTweetPerDay: ->
    650 * @index

class ProxyStatus
  constructor: (@text, image, screen, name = screen)->
    @user =
      profile_image_url: image
      screen_name: screen
      name: name
