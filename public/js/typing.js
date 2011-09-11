var Code, Dict, RomanizationGraph, Traverser, rg, traverser;
rg = null;
traverser = null;
$(document).ready(function() {
  var text;
  text = "てすとのぶんしょう";
  $("#text").text(text);
  rg = new RomanizationGraph(text);
  traverser = rg.traverser();
  $("#romaji").text(traverser.decode());
  return $("#input").text(traverser.decode());
});
$(document).keydown(function(event) {
  var chr;
  chr = String.fromCharCode(event.keyCode).toLowerCase();
  if (traverser.traverse(chr)) {
    $("#inputed").text(traverser.getFixedText());
    return $("#input").text(traverser.decode());
  }
});
Array.prototype.clone = function() {
  return this.concat();
};
RomanizationGraph = (function() {
  function RomanizationGraph(sentence) {
    var chr, code, codes, index, ncode, nextChr, nextIndex, nflag, nnode, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
    this.graph = [];
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
  RomanizationGraph.prototype.traverser = function() {
    return new Traverser(this.graph);
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
Traverser = (function() {
  function Traverser(graph) {
    this.graph = graph;
    this.index = 0;
    this.codeIndex = 0;
    this.position = 0;
    this.fixed = [];
  }
  Traverser.prototype.getFixedText = function() {
    return this.fixed.join('');
  };
  Traverser.prototype.decode = function() {
    var node, ret, top;
    if (!(this.index < this.graph.length)) {
      return "";
    }
    top = this.graph[this.index];
    ret = [top[this.codeIndex].code.slice(this.position).join('')];
    node = this.graph[top[0].next];
    while (node != null) {
      ret.push(node[0].code.join(''));
      node = this.graph[node[0].next];
    }
    return ret.join('');
  };
  Traverser.prototype.traverse = function(chr) {
    var code, flag, i, _ref, _ref2;
    if (!(this.index < this.graph.length)) {
      return false;
    }
    flag = false;
    for (i = _ref = this.codeIndex, _ref2 = this.graph[this.index].length - 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
      code = this.graph[this.index][i];
      if (code.code[this.position] === chr) {
        if (!flag) {
          this.codeIndex = i;
        }
        flag = true;
        if ((this.position + 1) === code.code.length) {
          this.fixed.push(chr);
          this.index = code.next;
          this.codeIndex = 0;
          this.position = 0;
          return true;
        }
      }
    }
    if (flag) {
      this.position++;
      this.fixed.push(chr);
    }
    return flag;
  };
  Traverser.prototype.hasFinished = function() {
    return this.index >= this.graph.length;
  };
  return Traverser;
})();