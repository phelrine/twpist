rg = null

$(document).ready ->
  text = "てすとぶんしょう"
  $("#text").text text
  rg = new RomanizationGraph text
  $("#romaji").text rg.decode()

$(document).keydown (event)->
  $("#input").text("")
  chr = String.fromCharCode(event.keyCode).toLowerCase()
  if rg.check chr
    $("#inputed").text($("#inputed").text() + chr)
  else
    $("#input").text(chr)

Array::clone = -> @concat()

class RomanizationGraph
  constructor: (sentence)->
    @graph = []
    @pos = 0
    index = 0
    nflag = false
    for chr in sentence
      node = []
      nextIndex = index + 1
      nextChr = sentence[nextIndex]

      if chr is "っ" and sentence[nextIndex]? and nextChr isnt "ん"
        codes = if sentence[nextIndex + 1]? then Dict.conv(nextChr + sentence[nextIndex + 1]) else []
        node = node.concat((new Code (code[0] + code).split(''), nextIndex + 2) for code in codes)
        node = node.concat((new Code (code[0] + code).split(''), nextIndex + 1) for code in Dict.conv(nextChr))
      node.push new Code code.split(''), (nextIndex + 1) for code in Dict.conv(chr + nextChr) if nextChr?
      node.push new Code code.split(''), (nextIndex) for code in Dict.conv(chr)

      if nflag
        nnode = for code in node
          ncode = new Code code.code.clone(), code.next
          ncode.code.unshift "n"
          ncode
        node = node.concat(nnode)

      @graph.push node
      nflag = (chr is "ん")
      index++

  decode: ->
    node = @graph[@pos]
    ret = while node?
      seq = node[0].code.join('')
      node = @graph[node[0].next]
      seq
    ret.join('')

  check: (chr)->
    return false unless @pos < @graph.length
    pos = @pos
    flag = false
    for code in @graph[@pos]
      if code.code[0] is chr
        console.log code.code
        console.log code.next
        code.code.shift()
        if code.code.length is 0
          pos = code.next
          console.log @graph[pos]
        flag = true
    @pos = pos
    flag

class Dict
  @conv: (chr)->
    code = DICTIONARY[chr]
    switch typeof code
      when "string" then [code]
      when "undefined" then []
      else code


class Code
  constructor: (@code, @next)->
