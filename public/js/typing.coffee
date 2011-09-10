class RomanizationGraph
  constructor: (sentence)->
    @pos = 0
    @fixed = []
    index = 0
    @graph = for chr in sentence
      node = []
      nextIndex = index + 1
      nextChr = sentence[nextIndex]
      if chr is "っ" and nextChr? and nextChr isnt "ん"
        codes = Dict.conv(nextChr + sentence[nextIndex + 1]) if sentence[nextIndex + 1]?
        node = node.concat((new Code (code[0] + code).split(''), nextIndex + 2) for code in codes)
        node = node.concat((new Code (code[0] + code).split(''), nextIndex + 1) for code in Dict.conv(nextChr))
      node.push new Code code.split(''), (nextIndex + 1) for code in Dict.conv(chr + nextChr) if nextChr?
      node.push new Code code.split(''), (nextIndex) for code in Dict.conv(chr)
      index++
      node

  decode: ->
    node = @graph[@pos]
    ret = while node?
      seq = node[0].code.join('')
      node = @graph[node[0].next]
      seq
    ret.join('')


class Dict
  @conv: (chr)->
    code = DICTIONARY[chr]
    switch typeof code
      when "string" then [code]
      when "undefined" then []
      else code


class Code
  constructor: (@code, @next)->
