// Generated by CoffeeScript 1.12.6
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function($) {
    "use strict";
    var Mentions, MentionsCKEditor, MentionsHandlerBase, MentionsInput;
    $.widget("ui.mentionsAutocomplete", $.ui.autocomplete, {
      options: $.extend({}, $.ui.autocomplete.prototype.options, {
        messages: {
          noResults: ""
        }
      }),
      _create: function() {
        this.overriden = {
          select: this.options.select,
          focus: this.options.focus,
          change: this.options.change
        };
        this.options.select = $.proxy(this.selectCallback, this);
        this.options.focus = $.proxy(this.focusCallback, this);
        this.options.change = $.proxy(this.changeCallback, this);
        $.ui.autocomplete.prototype._create.call(this);
        this.liveRegion.remove();
      },
      search: function(value, event) {
        if (!value) {
          return false;
        }
        return $.ui.autocomplete.prototype.search.call(this, value, event);
      },
      selectCallback: function(event, ui) {
        if (this.overriden.select) {
          return this.overriden.select(event, ui);
        }
        return false;
      },
      focusCallback: function(event, ui) {
        if (this.overriden.focus) {
          return this.overriden.focus(event, ui);
        }
        return false;
      },
      changeCallback: function(event, ui) {
        if (this.overriden.change) {
          return this.overriden.change(event, ui);
        }
        return false;
      },
      _value: function() {
        return false;
      },
      _renderItem: function(ul, item) {
        if (typeof this.options.renderItem === "function") {
          return this.options.renderItem(ul, item);
        }
        return $.ui.autocomplete.prototype._renderItem.call(this, ul, item);
      }
    });
    MentionsHandlerBase = (function() {
      function MentionsHandlerBase(mentions1) {
        this.mentions = mentions1;
        this.element = $(this.mentions.element);
        this.cache = {
          mentions: [],
          value: {
            original: "",
            compiled: ""
          }
        };
      }

      MentionsHandlerBase.prototype.initEvents = function() {
        throw "initEvents method is not implemented";
      };

      MentionsHandlerBase.prototype.setValue = function(value) {
        throw "setValue method is not implemented";
      };

      return MentionsHandlerBase;

    })();
    MentionsInput = (function(superClass) {
      extend(MentionsInput, superClass);

      function MentionsInput(mentions1) {
        this.mentions = mentions1;
        MentionsInput.__super__.constructor.call(this, this.mentions);
        this.createHiddenField();
        this.element.mentionsAutocomplete(jQuery.extend({}, {
          select: (function(_this) {
            return function(event, ui) {
              return _this.onSelect(event, ui);
            };
          })(this),
          appendTo: this.element.parent()
        }, this.mentions.settings.autocomplete));
      }

      MentionsInput.prototype.initEvents = function() {
        return this.element.on("input", (function(_this) {
          return function(event) {
            return _this.handleInput(event);
          };
        })(this));
      };

      MentionsInput.prototype.handleInput = function() {
        var match1, match2, position, query, trigger, value;
        position = this.element.caret("pos");
        value = this.element.val().substring(0, position);
        this.refreshMentions(this.cache.value.compiled, this.compile(this.element.val()));
        this.cache.value = {
          original: this.decompile(this.element.val()),
          compiled: this.compile(this.element.val())
        };
        this.updateValues();
        match1 = /(\S+)$/g.exec(value);
        if (!match1) {
          this.element.mentionsAutocomplete("close");
          return;
        }
        trigger = this.mentions.settings.trigger;
        match2 = new RegExp("(?:^|\s)[" + trigger + "]([^" + trigger + "]{" + this.mentions.settings.length.join(",") + "})$").exec(match1[0]);
        if (!match2) {
          this.element.mentionsAutocomplete("close");
          return;
        }
        this.start = match1.index;
        this.end = this.start + match2[0].length;
        query = match2[1];
        if (this.timer) {
          window.clearTimeout(this.timer);
        }
        return this.timer = window.setTimeout((function(_this) {
          return function() {
            return _this.mentions.fetchData(query, function(response) {
              _this.element.mentionsAutocomplete("option", "source", function(req, add) {
                return add(response);
              });
              return _this.element.mentionsAutocomplete("search", query);
            });
          };
        })(this), this.mentions.settings.delay);
      };

      MentionsInput.prototype.createHiddenField = function() {
        this.hidden = $("<input />", {
          type: "hidden",
          name: this.element.attr("name")
        });
        return this.element.after(this.hidden).removeAttr("name");
      };

      MentionsInput.prototype.updateValues = function() {
        this.hidden.val(this.cache.value.original);
        return this.element.val(this.cache.value.compiled);
      };

      MentionsInput.prototype.compile = function(value) {
        var j, len, mention, piece, position, ref, result;
        result = "";
        position = 0;
        ref = this.cache.mentions;
        for (j = 0, len = ref.length; j < len; j++) {
          mention = ref[j];
          result += value.substring(position, mention.start.original);
          piece = value.substring(mention.start.original, mention.start.original + mention.value.original.length);
          position += value.substring(position, mention.start.original).length;
          if (mention.value.original === piece) {
            result += mention.value.compiled;
            position += piece.length;
          }
        }
        return result + value.substring(position);
      };

      MentionsInput.prototype.decompile = function(value) {
        var j, len, mention, piece, position, ref, result;
        result = "";
        position = 0;
        ref = this.cache.mentions;
        for (j = 0, len = ref.length; j < len; j++) {
          mention = ref[j];
          result += value.substring(position, mention.start.compiled);
          piece = value.substring(mention.start.compiled, mention.start.compiled + mention.value.compiled.length);
          position += value.substring(position, mention.start.compiled).length;
          if (mention.value.compiled === piece) {
            result += mention.value.original;
            position += piece.length;
          }
        }
        return result + value.substring(position);
      };

      MentionsInput.prototype.refreshMentions = function(oldValue, newValue) {
        var cursor, diff, item, j, k, key, len, len1, mention, piece, position, ref, results, setPosition, value;
        position = 0;
        if (newValue) {
          value = newValue;
        } else {
          value = this.cache.value.compiled;
        }
        if (oldValue && newValue) {
          diff = JsDiff.diffChars(oldValue, newValue);
          cursor = 0;
          setPosition = (function(_this) {
            return function(cursor, delta) {
              var j, key, len, mention, ref, results;
              ref = _this.cache.mentions;
              results = [];
              for (key = j = 0, len = ref.length; j < len; key = ++j) {
                mention = ref[key];
                if (mention.start.compiled >= cursor) {
                  results.push(_this.cache.mentions[key].start.compiled += delta);
                } else {
                  results.push(void 0);
                }
              }
              return results;
            };
          })(this);
          for (j = 0, len = diff.length; j < len; j++) {
            item = diff[j];
            if (item.added) {
              setPosition(cursor, item.count);
            } else if (item.removed) {
              setPosition(cursor, -item.count);
            }
            if (!item.removed) {
              cursor += item.count;
            }
          }
        }
        ref = this.cache.mentions;
        results = [];
        for (key = k = 0, len1 = ref.length; k < len1; key = ++k) {
          mention = ref[key];
          piece = value.substring(mention.start.compiled, mention.start.compiled + mention.value.compiled.length);
          position = value.substring(position, mention.start.compiled).length;
          if (mention.value.compiled === piece) {
            this.cache.mentions[key].start.original = position;
            results.push(position += piece.length);
          } else {
            results.push(this.cache.mentions.splice(key, 1));
          }
        }
        return results;
      };

      MentionsInput.prototype.onSelect = function(event, ui) {
        var after, before, mention, start, value;
        before = this.cache.value.compiled.substring(0, this.start);
        after = this.cache.value.compiled.substring(this.end);
        mention = this.mentions.settings.template(ui.item);
        start = {
          original: 0,
          compiled: this.start
        };
        value = {
          original: this.mentions.settings.markup(ui.item),
          compiled: mention
        };
        this.cache.mentions.push({
          start: start,
          value: value
        });
        value = before + mention + this.mentions.settings.suffix + after;
        this.cache.value.compiled = value;
        this.refreshMentions();
        this.cache.value.original = this.decompile(value);
        return this.updateValues();
      };

      MentionsInput.prototype.setValue = function(value) {
        this.cache.value = {
          original: this.decompile(value),
          compiled: this.compile(value)
        };
        this.updateValues();
        return this.refreshMentions();
      };

      return MentionsInput;

    })(MentionsHandlerBase);
    MentionsCKEditor = (function(superClass) {
      extend(MentionsCKEditor, superClass);

      function MentionsCKEditor(mentions1) {
        var editor, element, mentions;
        this.mentions = mentions1;
        MentionsCKEditor.__super__.constructor.call(this, this.mentions);
        this.createHiddenField();
        this.editor = CKEDITOR.instances[this.element.attr("id")];
        this.mentions.settings.suffix = this.mentions.settings.suffix.replace(" ", "\u00A0");
        editor = this.editor;
        element = this.element;
        mentions = this.mentions;
        this.element.mentionsAutocomplete(jQuery.extend({}, this.mentions.settings.autocomplete, {
          select: (function(_this) {
            return function(event, ui) {
              return _this.onSelect(event, ui);
            };
          })(this),
          appendTo: this.element.parent(),
          open: function(event, ui) {
            var offset, position, top;
            position = $(editor.document.$.body).caret("position", {
              iframe: editor.window.$.frameElement
            });
            offset = $(editor.document.$.body).caret("offset", {
              iframe: editor.window.$.frameElement
            });
            top = 5 + position.height + position.top + $(editor.ui.space("top").$).outerHeight(true) + offset.height;
            element.data("ui-mentionsAutocomplete").menu.element.css({
              left: 0,
              top: top
            });
            if (mentions.settings.autocomplete.open) {
              return mentions.settings.autocomplete.open.call(this, event, ui);
            }
          }
        }));
      }

      MentionsCKEditor.prototype.initEvents = function() {
        this.editor.on("change", (function(_this) {
          return function() {
            return _this.handleInput();
          };
        })(this));
        return $(this.editor.window.$.document.body).on("click", (function(_this) {
          return function() {
            return _this.element.mentionsAutocomplete("close");
          };
        })(this));
      };

      MentionsCKEditor.prototype.handleInput = function() {
        var match1, match2, node, position, query, selection, trigger, value;
        this.refreshMentions();
        this.updateValues();
        selection = this.editor.window.$.getSelection();
        node = selection.focusNode;
        value = node.textContent;
        position = selection.focusOffset;
        value = value.substring(0, position);
        match1 = /(\S+)$/g.exec(value);
        if (this.timer) {
          window.clearTimeout(this.timer);
        }
        if (!match1) {
          this.element.mentionsAutocomplete("close");
          return;
        }
        trigger = this.mentions.settings.trigger;
        match2 = new RegExp("(?:^|\s)[" + trigger + "]([^" + trigger + "]{" + this.mentions.settings.length.join(",") + "})$").exec(match1[0]);
        if (!match2) {
          this.element.mentionsAutocomplete("close");
          return;
        }
        this.start = match1.index;
        this.end = this.start + match2[0].length;
        query = match2[1];
        return this.timer = window.setTimeout((function(_this) {
          return function() {
            return _this.mentions.fetchData(query, function(response) {
              _this.element.mentionsAutocomplete("option", "source", function(req, add) {
                return add(response);
              });
              return _this.element.mentionsAutocomplete("search", query);
            });
          };
        })(this), this.mentions.settings.delay);
      };

      MentionsCKEditor.prototype.createHiddenField = function() {
        this.hidden = $("<input />", {
          type: "hidden",
          name: this.element.attr("name")
        });
        return this.element.after(this.hidden).removeAttr("name");
      };

      MentionsCKEditor.prototype.updateValues = function() {
        return this.hidden.val(this.getValue());
      };

      MentionsCKEditor.prototype.refreshMentions = function() {
        var j, key, len, mention, ref, results;
        ref = this.cache.mentions;
        results = [];
        for (key = j = 0, len = ref.length; j < len; key = ++j) {
          mention = ref[key];
          if (mention.$node.html() !== this.mentions.settings.template(mention.item)) {
            results.push(this.cache.mentions.splice(key, 1));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      MentionsCKEditor.prototype.onSelect = function(event, ui) {
        var $node, _id, mention, position;
        _id = Math.random().toString().split(".")[1];
        mention = this.mentions.settings.template(ui.item);
        position = {
          start: this.start,
          end: this.end
        };
        $node = $("<mention />", {
          id: _id
        }).html(mention).data("mentionItem", ui.item);
        ui.item._id = _id;
        this.insertMention($node, position, ui.item);
        this.updateValues();
        return this.editor.focus();
      };

      MentionsCKEditor.prototype.insertMention = function($node, position, item) {
        var node, range, selection, suffix;
        selection = this.editor.window.$.getSelection();
        node = selection.focusNode;
        range = selection.getRangeAt(0);
        range.setStart(node, position.start);
        range.setEnd(node, position.end);
        range.deleteContents();
        if (this.mentions.settings.suffix) {
          suffix = document.createTextNode(this.mentions.settings.suffix);
          range.insertNode($node.get(0));
          $node.after(suffix);
          range.setStartAfter(suffix);
        } else {
          range.insertNode($node.get(0));
        }
        this.cache.mentions.push({
          position: position,
          item: item,
          $node: $node
        });
        range.collapse(true);
        selection.removeAllRanges();
        return selection.addRange(range);
      };

      MentionsCKEditor.prototype.getValue = function() {
        var $container, j, len, markup, mention, ref;
        $container = $(this.editor.document.$.body.cloneNode(true));
        ref = this.cache.mentions;
        for (j = 0, len = ref.length; j < len; j++) {
          mention = ref[j];
          markup = this.mentions.settings.markup(mention.item);
          $("mention#" + mention.item._id, $container).before(markup).remove();
        }
        return $container.html();
      };

      MentionsCKEditor.prototype.setValue = function(value) {
        this.editor.setData(value);
        this.updateValues();
        return this.refreshMentions();
      };

      return MentionsCKEditor;

    })(MentionsHandlerBase);
    Mentions = (function() {
      function Mentions(element1, settings) {
        var ref;
        this.element = element1;
        this.settings = $.extend({}, {
          trigger: "@",
          suffix: " ",
          delay: 200,
          source: [],
          length: [1, 20],
          autocomplete: {},
          markup: function(item) {
            return "[~" + item.value + "]";
          },
          template: function(item) {
            return item.label;
          }
        }, settings);
        $(this.element).wrap($("<div />", {
          "class": "mentions-input"
        }));
        if (window.CKEDITOR && window.CKEDITOR.instances[this.element.id]) {
          this.handler = new MentionsCKEditor(this);
        } else if ((ref = this.element.tagName) === "INPUT" || ref === "TEXTAREA") {
          this.handler = new MentionsInput(this);
        } else {
          throw "Element " + this.element.tagName + " is not supported";
        }
        this.handler.initEvents();
      }

      Mentions.prototype.fetchData = function(query, callback) {
        if (typeof this.settings.source === "object") {
          return callback(this.settings.source);
        } else if (typeof this.settings.source === "string") {
          return $.getJSON(this.settings.source, {
            term: query
          }, function(response) {
            return callback(response);
          });
        }
      };

      return Mentions;

    })();
    return $.fn.extend({
      mentionsInput: function(settings) {
        return this.each(function(i, e) {
          return $(e).data("mentionsInput", new Mentions(e, settings));
        });
      }
    });
  })(jQuery);

}).call(this);

