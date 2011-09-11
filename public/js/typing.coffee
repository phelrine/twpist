rg = null
traverser = null

$(document).ready ->
  text = "てすとのぶんしょう"
  $("#text").text text
  rg = new RomanizationGraph(text)
  traverser = rg.traverser()
  $("#romaji").text traverser.decode()
  $("#input").text traverser.decode()

$(document).keydown (event)->
  chr = String.fromCharCode(event.keyCode).toLowerCase()
  if traverser.traverse chr
    $("#inputed").text(traverser.getFixedText())
    $("#input").text traverser.decode()

Array::clone = -> @concat()

class RomanizationGraph
  constructor: (sentence)->
    @graph = []
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

  traverser: -> new Traverser @graph


class Dict
  @conv: (chr)->
    code = DICTIONARY[chr]
    switch typeof code
      when "string" then [code]
      when "undefined" then []
      else code


class Code
  constructor: (@code, @next)->


class Traverser
  constructor: (@graph)->
    @index = 0
    @codeIndex = 0
    @position = 0
    @fixed = []

  getFixedText: ->
    @fixed.join('')

  decode: ->
    return "" unless @index < @graph.length
    top = @graph[@index]
    ret = [top[@codeIndex].code.slice(@position).join('')]
    node = @graph[top[0].next]
    while node?
      ret.push node[0].code.join('')
      node = @graph[node[0].next]
    ret.join('')

  traverse: (chr)->
    return false unless @index < @graph.length
    flag = false
    for i in [@codeIndex .. (@graph[@index].length - 1)]
      code = @graph[@index][i]
      if code.code[@position] is chr
        @codeIndex = i if not flag
        flag = true
        if (@position + 1) is code.code.length
          @fixed.push chr
          @index = code.next
          @codeIndex = 0
          @position = 0
          return true

    (@position++; @fixed.push chr) if flag
    flag

  hasFinished: -> @index >= @graph.length