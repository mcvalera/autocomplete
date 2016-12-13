/* Given an input and an endpoint which returns a JSON list as a result, extend it to autocomplete on change, handle key navigation through the results */

var Autocomplete = (function() {
  'use strict';

  function Autocomplete(config) {
    this.inputNode = config.inputNode;
    this.dataSourceUrl = config.dataSourceUrl || null;
    this.param = config.param || null;
    this.query = '';
    this.results = null;
    this.maxSuggestions = config.maxSuggestions || null; // max number of suggestions to show
    this.minInput = config.minInput || null; // minimum input before requesting results

    if (!this.dataSourceUrl) {
      throw new Error('no data source available');
    }

    this.init();
  }


  Autocomplete.prototype = (function() {

    var init = function() {
      this.wrapTarget();
      this.attachListener();
    }

    var wrapTarget = function() {
      var wrapper = document.createElement('div');
      var input = this.inputNode;
      this.resultsContainer = document.createElement('ul');
      this.resultsContainer.classList.add('ui-autocomp-suggestions');

      wrapper.classList.add('ui-autocomp');
      input.classList.add('ui-autocomp');
      input.parentNode.insertBefore(wrapper, input);
      input.parentNode.removeChild(input);
      wrapper.append(input);
      wrapper.append(this.resultsContainer);
    }

    var attachListener = function() {
      var that = this;

      // callback functions for events on input
      var inputFunc = {
        'input': function() {
          that.setQuery();
          var minInput = that.minInput || 0;
          if (that.query.length >= minInput) {
            that.getResults();
          } else {
            that.clearResults();
          }
        },
        'keydown': function(e) {
          var resultsContainer = that.resultsContainer;
          switch (e.keyCode) {
            case 40: // down arrow
              debugger;
              resultsContainer.firstElementChild.focus(); // focus on first suggestion in li
              break;
            case 38: // up arrow
              resultsContainer.lastElementChild.focus(); // focus on last suggestion in li
              break;
          }
        }
      }

      _addMultEventListeners(this.inputNode, inputFunc)

      // callback functions for events on results container
      var resultsFunc = {
        'change': function(e) {
          that.clearResults();
        },
        'click': function(e) {
          e.preventDefault();
          that.selectSuggestion();
          that.clearResults();
        },
        'keydown': function(e) {
          var activeEl = document.activeElement;
          switch (e.keyCode) {
            case 40: // down arrow
              var nextSib = activeEl.nextElementSibling;
              if (nextSib) {
                nextSib.focus() // focus on next suggestion in li
              } else {
                that.inputNode.focus(); // focus on input
              }
              break;
            case 38: // up arrow
              var prevSib = activeEl.previousElementSibling;
              if (prevSib) {
                prevSib.focus() // focus on prev suggestion in li
              } else {
                that.inputNode.focus(); // focus on input
              }
              break;
            case 13: // enter key
              that.selectSuggestion();
              that.clearResults();
              break;
          }
        }
      }

      _addMultEventListeners(this.resultsContainer, resultsFunc);

      function _addMultEventListeners(el, func) {
        for (var key in func) {
          el.addEventListener(key, func[key]);
        }
      }

    }

    var selectSuggestion = function() {
      this.inputNode.value = document.activeElement.getAttribute('data-label');
      this.setQuery();
    }

    var setQuery = function() {
      this.query = this.inputNode.value;
      return this.query;
    }

    var getQuery = function() {
      return this.query;
    }

    var getResults = function() {
      var xhr = new XMLHttpRequest();
      var params = '?' + this.param + '=' + this.getQuery();
      var that = this;

      xhr.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE) {
          that.results = JSON.parse(this.responseText);

          if (that.results.length > 0) {
            that.displayResults();
          }

        }
      }
      xhr.open('GET', this.dataSourceUrl + params); //
      xhr.send();
    }

    var clearResults = function() {
      this.resultsContainer.innerHTML = '';
    }

    var displayResults = function() {
      this.clearResults();
      var length = this.maxSuggestions || this.results.length;
      for (var i = 0; i < length; i++) {
        var result = this.results[i];
        var label = result.label.slice(this.query.length);
        var text = this.query + '<span class="highlight">' + label + '</span>';
        var listNode = document.createElement('li');
        listNode.setAttribute('tabindex', '0');
        listNode.setAttribute('data-label', result.label);
        listNode.innerHTML = text;
        this.resultsContainer.append(listNode);
      }
    }

    return {
      init: init,
      wrapTarget: wrapTarget,
      attachListener: attachListener,
      selectSuggestion: selectSuggestion,
      setQuery: setQuery,
      getQuery: getQuery,
      getResults: getResults,
      clearResults: clearResults,
      displayResults: displayResults
    }

  })();

  return Autocomplete;

})();