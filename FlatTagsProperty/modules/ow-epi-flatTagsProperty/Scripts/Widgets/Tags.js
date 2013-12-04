define([
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/fx",
    "dojo/keys",
    "dojo/on",

    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/fx",
    "dojo/_base/lang",

    "dijit/focus",

    "dijit/form/ComboBox",

    "dojo/store/Memory",
    "dojo/store/JsonRest",

    "dojo/text!./Tags.html",
    "xstyle/css!./Tags.css"
], function (domAttr, domClass, domStyle, domConstruct, coreFx, keys, on, array, declare, event, baseFx, lang, focusUtil, ComboBox, Memory, JsonRest, template) {
    return declare("ow-epi-flatTagsProperty.widgets.Tags", [ComboBox], {
        templateString: template,
        
        getTagNode: function (id) {
            var node = null;

            array.forEach(this.textbox.parentNode.childNodes, function (item, i) {
                if (parseInt($(item).attr('data-id')) === id) {
                    node = item;
                }
            });
            
            return node;
        },
        
        getTag : function(id) {
            var tag = null;

            array.forEach(this.currentTags, function (item, i) {
                if (item.id === id) {
                    tag = item;
                }
            });

            return tag;
        },
        
        //new
        currentTags : [],
        //new

        _valuesLoaded: false,

        blinkBackground: function (node, blinks) {

            //            This would be nice, but it doesn't work on mozilla (domStyle.get returns undefined), hence we have to hardcode color ;( 
            //
            //            if (this.tagBackgroundColor == null || this.tagBackgroundColor == undefined)
            //                this.tagBackgroundColor = domStyle.get(node, "background-color");

            var red = baseFx.animateProperty({
                node: node,
                properties: {
                    backgroundColor: "rgb(181, 0, 0)"
                },
                duration: 100,
                delay: 50
            });

            var white = baseFx.animateProperty({
                node: node,
                properties: {
                    backgroundColor: "rgb(35, 180, 233)"
                },
                duration: 100,
                delay: 50
            });

            var effects = new Array();
            for (var i = 0; i < blinks; i++) {
                effects.push(red);
                effects.push(white);
            }

            coreFx.chain(effects).play();
        },

        getCaretPos: function (field) {
            try {
                return this._getCaretPos(field);
            } catch (e) {
                return 0;
            }
        },

        recalculateInputWidth: function () {
            this.recalculateInputWidthFromValue(this.textbox.value);
        },
        
        recalculateInputWidthFromValue: function(value) {
            this.divSobana.innerHTML = value;

            var width = Math.min(Math.max(this.divSobana.offsetWidth, 25), 450) + 20;
            domAttr.set(this.textbox, "style", "width: " + width + "px !important;");
        },

        postCreate: function () {
            this.inherited(arguments);

            domStyle.set(this._popupStateNode, "display", "none");

            on(this.textbox, "keyup", lang.hitch(this, this.changeFocusOnKey));
            on(this.textbox, "keydown", lang.hitch(this, this.destroyPreviousElement));
            on(this.textbox, "keydown, keyup", lang.hitch(this, this.recalculateInputWidth));

            domClass.add(this.textbox, "smallInput");
        },

        changeFocusOnKey: function (evt) {
            var caretPos = this.getCaretPos(evt.currentTarget);
            var node = evt.currentTarget;
            if (caretPos == 0 && evt.keyCode == keys.LEFT_ARROW && node.previousSibling != null) {
                focusUtil.focus(node.previousSibling);
                event.stop(evt);
                return;
            }
            if (evt.keyCode == keys.RIGHT_ARROW && node.nextSibling != null) {
                focusUtil.focus(node.nextSibling);
                event.stop(evt);
                return;
            }
        },

        _handleOnChange: function () {
            arguments[1] = false;
            this.inherited(arguments);
        },

        _onKey: function (evt) {
            this.inherited(arguments);

            if (evt.keyCode == keys.ENTER) {
                this.addTagFromTextbox();
                event.stop(evt);
            }
        },
        
        _getValueAttr: function () {
            return  this.currentTags;
        },

        _setValueAttr: function (/*String*/ value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item) {
            if (displayedValue)
                this.recalculateInputWidthFromValue(displayedValue);

            if (item)
                this.autocompleteItem = item;

            if (!value || this._valuesLoaded === true)
                return;

            if ($.isArray(value))
                this.currentTags = value;
            
            this._valuesLoaded = true;

            array.forEach(this.currentTags, lang.hitch(this, function (entry) {
                this._addTagToDom(entry);
            }));
        },
        
        _save: function () {
            var that = this;
            var focused = focusUtil.curNode;
            this.onFocus();
            setTimeout(function () {
                that._set("value", that.currentTags);
                that.onChange(that.currentTags);
                focusUtil.curNode.blur();
                focusUtil.focus(focused);
            }, 0);
        },

        destroyPreviousElement: function (evt) {
            var caretPos = this.getCaretPos(evt.currentTarget);
            var node = evt.currentTarget;

            if (caretPos !== 0 || evt.keyCode !== keys.BACKSPACE || !node.previousElementSibling)
                return;

            var tagId = parseInt($(node.previousElementSibling).attr('data-id'));

            if (!tagId)
                return;
            
            var tag = this.getTag(tagId);

            if (!tag)
                return;
            
            this.removeTag(tag);
            this.recalculateInputWidth();
            return;
        },
        
        destroyTagOnKey: function (evt) {
            var node = evt.currentTarget;
            var tag = this.getTag(parseInt($(node).attr('data-id')));
            if (evt.keyCode == keys.BACKSPACE) {
                if (node.previousElementSibling != null)
                    focusUtil.focus(node.previousElementSibling);
                else
                    focusUtil.focus(node.nextElementSibling);
                
                this.removeTag(tag);
                this.recalculateInputWidth();

                event.stop(evt);
                return;
            }

            if (evt.keyCode == keys.DELETE && node.nextElementSibling != null) {
                focusUtil.focus(node.nextElementSibling);

                this.removeTag(tag);
                this.recalculateInputWidth();

                event.stop(evt);
                return;
            }
        },

        isValid: function () {
            return true;
        },
        
        autocompleteItem: null,

        

        focusInput: function (evt) {
            if (evt.keyCode == 8 || evt.keyCode == 16 || evt.keyCode == 46 || (evt.keyCode >= 37 && evt.keyCode <= 40))
                return;

            focusUtil.focus(this.textbox);
        },
        

        
        _selectOption: function (target) {
            this.inherited(arguments);
            this.addTagFromAutocomplete();
        },
        
        addTagFromAutocomplete: function () {
            if (!this.autocompleteItem)
                return;

            this.addTag(this.autocompleteItem);
        },
        
        addTagFromTextbox: function() {
            if (!this.autocompleteItem || this.autocompleteItem.name !== this.textbox.value)
                return;
            
            this.addTag(this.autocompleteItem);
        },
        
        addTag: function (tag) {
            if (this.getTag(tag.id)) {
                var node = this.getTagNode(tag.id);
                this.blinkBackground(node, 3);
                this.textbox.value = "";
                return;
            }

            this.currentTags.push(tag);
            this._addTagToDom(tag);
            this._save();
        },

        _addTagToDom: function (tag) {
            var value = tag.name;
            var newDiv = domConstruct.toDom("<div class='tag' data-id='" + tag.id + "' tabindex='-1'>" + value + "</div>");

            on(newDiv, "keydown", lang.hitch(this, this.changeFocusOnKey));
            on(newDiv, "keydown", lang.hitch(this, this.destroyTagOnKey));
            on(newDiv, "keydown", lang.hitch(this, this.focusInput));

            domConstruct.place(newDiv, this.textbox, "before");

            this.textbox.value = "";
        },
        
        removeTag : function(tag) {
            var index = this.currentTags.indexOf(tag);
            if (index > -1) {
                this.currentTags.splice(index, 1);
            }
            this.removeTagFromDom(tag);
            this._save();
        },

        removeTagFromDom: function (tag) {
            var node = this.getTagNode(tag.id);
            domConstruct.destroy(node);
        },
        
        store: new JsonRest({
            target: "/api/Values/"
        }),
        searchAttr: "name"
    });
});