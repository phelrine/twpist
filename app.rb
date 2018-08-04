require 'sinatra/base'
require 'omniauth-twitter'
require 'twitter'
require 'json'
require 'nkf'
# require 'MeCab'
require 'pp'

class TwpistApp < Sinatra::Base
  enable :logging

  use Rack::Session::Cookie
  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_CONSUMER_KEY'], ENV['TWITTER_CONSUMER_SECRET']
  end

  helpers do
    def consumer
      @consumer ||= OAuth::Consumer.new(ENV['TWITTER_CONSUMER_KEY'], ENV['TWITTER_CONSUMER_SECRET'], :site => "https://api.twitter.com/")
    end

    def logout
      session.delete :user
      session.delete :token
      session.delete :secret
    end
  end

  error do
    "sorry"
  end

  not_found do
    "404"
  end

  get '/' do
    redirect '/game' if session[:user]
    erb :index
  end

  get '/timeline.json' do
    if session[:user]
      begin
        client = Twitter::REST::Client.new do |c|
          c.consumer_key = ENV['TWITTER_CONSUMER_KEY']
          c.consumer_secret = ENV['TWITTER_CONSUMER_SECRET']
          c.access_token = session[:token]
          c.access_token_secret = session[:secret]
        end
      rescue
        logout if error.message == "Could not authenticate with OAuth."
        halt 500
      end
    end
    content_type :json
    client.home_timeline(:count => 200).to_a.map{|status|
      ret = status.to_hash
      ret[:yomi] = NKF.nkf("-w --hiragana", MeCab::Tagger.new("-O yomi").parse(status.text)).chomp
      ret
    }.to_json
  end

  get '/auth/twitter/callback' do
    auth = request.env["omniauth.auth"]
    pp auth
    session[:user] = auth["info"]["nickname"]
    session[:token] = auth["credentials"]["token"]
    session[:secret] = auth["credentials"]["secret"]
    redirect '/game'
  end

  get '/game' do
    @screen_name = session[:user]
    erb :game
  end

  post '/logout' do
    logout
    ""
  end
end
