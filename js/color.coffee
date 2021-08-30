d3 = require '../libs/d3/d3.js'

# список цветов можно посмотреть тут:
# https://github.com/mbostock/d3/wiki/Ordinal-Scales#category20
#1f77b4 #0
#aec7e8 #1
#ff7f0e #2
#ffbb78 #3
#2ca02c #4
#98df8a #5
#d62728 #6
#ff9896 #7
#9467bd #8
#c5b0d5 #9
#8c564b #10
#c49c94 #11
#e377c2 #12
#f7b6d2 #13
#7f7f7f #14
#c7c7c7 #15
#bcbd22 #16
#dbdb8d #17
#17becf #18
#9edae5 #19
#000000 #20
colors = d3.scale.category20().domain [0..20]
colors.range().push "#000000"

module.exports = (klass, property) ->
  class Colors
    constructor: ->

  Colors.get = (number) -> colors(number)

  property = klass[0].toLowerCase() + klass.slice(1) unless property?

  Colors::['get' + klass] = ->
    if _.isString @[property]
      @[property]
    else
      @['set' + klass](@[property])

  Colors::['set' + klass] = (color) ->
    @[property] = colors(color) if _.isNumber(color)
    @[property] = color if _.isString(color)
    @update() if @el?
    @[property]

  Colors::[klass] = (color) ->
    if color?
      @['set' + klass](color)
    else
      @['get' + klass]()

  return Colors