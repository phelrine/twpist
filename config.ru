require './app'
require 'dotenv'

Dotenv.load
run Sinatra::Application
