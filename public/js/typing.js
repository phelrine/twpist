var Code, Dict, RomanizationGraph, rg;
rg = null;
$(document).ready(function() {
  var text;
  text = "てすとぶんしょう";
  $("#text").text(text);
  rg = new RomanizationGraph(text);
  return $("#romaji").text(rg.decode());
});
$(document).keydown(function(event) {
  var chr;
  $("#input").text("");
  chr = String.fromCharCode(event.keyCode).toLowerCase();
  if (rg.check(chr)) {
    return $("#inputed").text($("#inputed").text() + chr);
  } else {
    return $("#input").text(chr);
  }
});
Array.prototype.clone = function() {
  return this.concat();
};
RomanizationGraph = (function() {
  function RomanizationGraph(sentence) {
    var chr, code, codes, index, ncode, nextChr, nextIndex, nflag, nnode, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
    this.graph = [];
    this.pos = 0;
    index = 0;
    nflag = false;
    for (_i = 0, _len = sentence.length; _i < _len; _i++) {
      chr = sentence[_i];
      node = [];
      nextIndex = index + 1;
      nextChr = sentence[nextIndex];
      if (chr === "っ" && (sentence[nextIndex] != null) && nextChr !== "ん") {
        codes = sentence[nextIndex + 1] != null ? Dict.conv(nextChr + sentence[nextIndex + 1]) : [];
        node = node.concat((function() {
          var _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = codes.length; _j < _len2; _j++) {
            code = codes[_j];
            _results.push(new Code((code[0] + code).split(''), nextIndex + 2));
          }
          return _results;
        })());
        node = node.concat((function() {
          var _j, _len2, _ref, _results;
          _ref = Dict.conv(nextChr);
          _results = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            code = _ref[_j];
            _results.push(new Code((code[0] + code).split(''), nextIndex + 1));
          }
          return _results;
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
      if (nflag) {
        nnode = (function() {
          var _l, _len4, _results;
          _results = [];
          for (_l = 0, _len4 = node.length; _l < _len4; _l++) {
            code = node[_l];
            ncode = new Code(code.code.clone(), code.next);
            ncode.code.unshift("n");
            _results.push(ncode);
          }
          return _results;
        })();
        node = node.concat(nnode);
      }
      this.graph.push(node);
      nflag = chr === "ん";
      index++;
    }
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
  RomanizationGraph.prototype.check = function(chr) {
    var code, flag, pos, _i, _len, _ref;
    if (!(this.pos < this.graph.length)) {
      return false;
    }
    pos = this.pos;
    flag = false;
    _ref = this.graph[this.pos];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      code = _ref[_i];
      if (code.code[0] === chr) {
        console.log(code.code);
        console.log(code.next);
        code.code.shift();
        if (code.code.length === 0) {
          pos = code.next;
          console.log(this.graph[pos]);
        }
        flag = true;
      }
    }
    this.pos = pos;
    return flag;
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