$:.unshift File.dirname(__FILE__)
require 'app'
require 'dotenv'

Dotenv.load

run TwpistApp
