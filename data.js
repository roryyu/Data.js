(function( window, undefined ) {
	var Data = (function() {
		var Data=function(){
			var args=arguments
			return new Data.fn.init(args);
		}
		Data.fn=Data.prototype={
			constructor: Data,
			init:function(args){
				this.content=args[0];
				this.opts=args[1];
			},
			version:'0.1',
			content:null,
			data:function(key,value){
				return Data.data( this.content,key,value );				
			},
			opts:{}
		}
		Data.fn.init.prototype = Data.fn;
		Data.extend = Data.fn.extend = function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			if ( typeof target === "boolean" ) {
				deep = target;
				target = arguments[1] || {};
				i = 2;
			}
		
			if ( typeof target !== "object" ) {
				target = {};
			}
		
			if ( length === i ) {
				target = this;
				--i;
			}
		
			for ( ; i < length; i++ ) {
				if ( (options = arguments[ i ]) != null ) {
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];
		
						if ( target === copy ) {
							continue;
						}
		
						if ( deep && copy ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src ? src : [];
		
							} else {
								clone = src ? src : {};
							}
		
							target[ name ] = Data.extend( deep, clone, copy );
		
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
		
			// Return the modified object
			return target;
		};
		var rmsPrefix = /^-ms-/,
			rdashAlpha = /-([a-z]|[0-9])/ig,
			fcamelCase = function( all, letter ) {
					return ( letter + "" ).toUpperCase();
			}				
		Data.extend({
			cache: {},
			uuid: 0,
			expando: "Data"+("Data"+Math.random()).replace(/\D/g,''),
			PATTERN:/^data\-(.*)$/,
			noData: {
				"embed": true,
				"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
				"applet": true
			},
			camelCase: function( string ) {
				return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
			},
			acceptData: function( elem ) {
				if ( elem.nodeName ) {
					var match = Data.noData[ elem.nodeName.toLowerCase() ];		
					if ( match ) {
						return !(match === true || elem.getAttribute("classid") !== match);
					}
				}		
				return true;
			},
			protogenic:function(elem){
				var pc={};
				var atts=elem.attributes;
				var length=atts.length;
				for(var i=0;i<length;i++){
					var match=atts[i].name.match(Data.PATTERN)
					if(match&&match[1]){
						if(/^\{.*\}$/.test(atts[i].nodeValue)){
							pc[match[1]]=Data.jsonParse(atts[i].nodeValue);
						}else{
							if(/^function/.test(atts[i].nodeValue)){
								var lang=atts[i].nodeValue;
								pc[match[1]]=function(){eval("("+lang+")()")};
							}else{
								pc[match[1]]=atts[i].nodeValue;
							}
							
						}
						
					}
				}
				return pc;
			},
			data:function(elem,name,d){
				if(!Data.acceptData(elem)){return}
				var thisCache, ret,
					internalKey = Data.expando,
					isNode = elem.nodeType,
					cache = isNode ? Data.cache : elem,
					id = isNode ? elem[Data.expando] : elem[Data.expando] && Data.expando;					
					if ( !id ) {
						if ( isNode ) {
							elem[Data.expando] = id = ++Data.uuid;
						} else {
							id = Data.expando;
						}
					}
					if ( !cache[ id ] ) {
							cache[ id ] = {};
					}
					thisCache = cache[ id ];
					if ( d !== undefined ) {
						thisCache[ Data.camelCase(name)] = d;
					}
					var pc=Data.protogenic(elem);
					thisCache=Data.extend(thisCache,pc);
					if(name!==undefined){
						ret = thisCache[ name ];
						if ( ret == null ) {
							ret = thisCache[Data.camelCase(name)];
						}							
					}else{
						ret = thisCache;
					}			
					return ret;
			}
		})
		var jsonParse = (function () {
			  var number
			      = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
			  var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]'
			      + '|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
			  var string = '(?:\"' + oneChar + '*\")';
			  var jsonToken = new RegExp(
			      '(?:false|true|null|[\\{\\}\\[\\]]'
			      + '|' + number
			      + '|' + string
			      + ')', 'g');

			  var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');

			  var escapes = {
			    '"': '"',
			    '/': '/',
			    '\\': '\\',
			    'b': '\b',
			    'f': '\f',
			    'n': '\n',
			    'r': '\r',
			    't': '\t'
			  };
			  function unescapeOne(_, ch, hex) {
			    return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
			  }

			  var EMPTY_STRING = new String('');
			  var SLASH = '\\';

			  var firstTokenCtors = { '{': Object, '[': Array };
			
			  var hop = Object.hasOwnProperty;
			
			  return function (json, opt_reviver) {

			    var toks = json.match(jsonToken);
			    var result;
			    var tok = toks[0];
			    var topLevelPrimitive = false;
			    if ('{' === tok) {
			      result = {};
			    } else if ('[' === tok) {
			      result = [];
			    } else {
			      result = [];
			      topLevelPrimitive = true;
			    }

			    var key;
			    var stack = [result];
			    for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
			      tok = toks[i];
			
			      var cont;
			      switch (tok.charCodeAt(0)) {
			        default:  // sign or digit
			          cont = stack[0];
			          cont[key || cont.length] = +(tok);
			          key = void 0;
			          break;
			        case 0x22:  // '"'
			          tok = tok.substring(1, tok.length - 1);
			          if (tok.indexOf(SLASH) !== -1) {
			            tok = tok.replace(escapeSequence, unescapeOne);
			          }
			          cont = stack[0];
			          if (!key) {
			            if (cont instanceof Array) {
			              key = cont.length;
			            } else {
			              key = tok || EMPTY_STRING;  // Use as key for next value seen.
			              break;
			            }
			          }
			          cont[key] = tok;
			          key = void 0;
			          break;
			        case 0x5b:  // '['
			          cont = stack[0];
			          stack.unshift(cont[key || cont.length] = []);
			          key = void 0;
			          break;
			        case 0x5d:  // ']'
			          stack.shift();
			          break;
			        case 0x66:  // 'f'
			          cont = stack[0];
			          cont[key || cont.length] = false;
			          key = void 0;
			          break;
			        case 0x6e:  // 'n'
			          cont = stack[0];
			          cont[key || cont.length] = null;
			          key = void 0;
			          break;
			        case 0x74:  // 't'
			          cont = stack[0];
			          cont[key || cont.length] = true;
			          key = void 0;
			          break;
			        case 0x7b:  // '{'
			          cont = stack[0];
			          stack.unshift(cont[key || cont.length] = {});
			          key = void 0;
			          break;
			        case 0x7d:  // '}'
			          stack.shift();
			          break;
			      }
			    }
			    if (topLevelPrimitive) {
			      if (stack.length !== 1) { throw new Error(); }
			      result = result[0];
			    } else {
			      if (stack.length) { throw new Error(); }
			    }
			
			    if (opt_reviver) {
			      var walk = function (holder, key) {
			        var value = holder[key];
			        if (value && typeof value === 'object') {
			          var toDelete = null;
			          for (var k in value) {
			            if (hop.call(value, k) && value !== holder) {
			              var v = walk(value, k);
			              if (v !== void 0) {
			                value[k] = v;
			              } else {
			                if (!toDelete) { toDelete = []; }
			                toDelete.push(k);
			              }
			            }
			          }
			          if (toDelete) {
			            for (var i = toDelete.length; --i >= 0;) {
			              delete value[toDelete[i]];
			            }
			          }
			        }
			        return opt_reviver.call(holder, key, value);
			      };
			      result = walk({ '': result }, '');
			    }
			
			    return result;
			  };
			})();
		Data.jsonParse=jsonParse;		
		return Data;
	})()
	window.Data=Data;
})(window)
