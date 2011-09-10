var Code, Dict, RomanizationGraph;
RomanizationGraph = (function() {
  function RomanizationGraph(sentence) {
    var chr, code, codes, index, nextChr, nextIndex, node;
    this.pos = 0;
    this.fixed = [];
    index = 0;
    this.graph = (function() {
      var _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
      _results = [];
      for (_i = 0, _len = sentence.length; _i < _len; _i++) {
        chr = sentence[_i];
        node = [];
        nextIndex = index + 1;
        nextChr = sentence[nextIndex];
        if (chr === "っ" && (nextChr != null) && nextChr !== "ん") {
          if (sentence[nextIndex + 1] != null) {
            codes = Dict.conv(nextChr + sentence[nextIndex + 1]);
          }
          node = node.concat((function() {
            var _j, _len2, _results2;
            _results2 = [];
            for (_j = 0, _len2 = codes.length; _j < _len2; _j++) {
              code = codes[_j];
              _results2.push(new Code((code[0] + code).split(''), nextIndex + 2));
            }
            return _results2;
          })());
          node = node.concat((function() {
            var _j, _len2, _ref, _results2;
            _ref = Dict.conv(nextChr);
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              code = _ref[_j];
              _results2.push(new Code((code[0] + code).split(''), nextIndex + 1));
            }
            return _results2;
          })());
        }
        if (nextChr != null) {
          _ref = Dict.conv(chr + nextChr);
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            code = _ref[_j];
            node.push(new Code(code.split(''), nextIndex + 1));
          }
        }
        _ref2 = Dict.conv(chr);
        for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
          code = _ref2[_k];
          node.push(new Code(code.split(''), nextIndex));
        }
        index++;
        _results.push(node);
      }
      return _results;
    })();
  }
  RomanizationGraph.prototype.decode = function() {
    var node, ret, seq;
    node = this.graph[this.pos];
    ret = (function() {
      var _results;
      _results = [];
      while (node != null) {
        seq = node[0].code.join('');
        node = this.graph[node[0].next];
        _results.push(seq);
      }
      return _results;
    }).call(this);
    return ret.join('');
  };
  return RomanizationGraph;
})();
Dict = (function() {
  function Dict() {}
  Dict.conv = function(chr) {
    var code;
    code = DICTIONARY[chr];
    switch (typeof code) {
      case "string":
        return [code];
      case "undefined":
        return [];
      default:
        return code;
    }
  };
  return Dict;
})();
Code = (function() {
  function Code(code, next) {
    this.code = code;
    this.next = next;
  }
  return Code;
})();