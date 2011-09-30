require 'bundler/setup'
require 'sinatra/base'
require 'omniauth'
require 'rubytter'
require 'json'
require 'nkf'
require 'MeCab'
require 'pp'

class TwpistApp < Sinatra::Base
  enable :sessions, :logging

  configure do
    CONSUMER_KEY, CONSUMER_SECRET = File.open(".consumer").read.split
  end

  use Rack::Session::Cookie
  use OmniAuth::Builder do
    provider :twitter, CONSUMER_KEY, CONSUMER_SECRET
  end

  helpers do
    def consumer
      @consumer ||= OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET, :site => "https://api.twitter.com/")
    end
  end

  get '/' do
    redirect '/home.html'
    # "twpist<br><a href='/auth/twitter'>twitter</a><br>"
  end

  get '/timeline.json' do
    if session[:user]
      rubytter = OAuthRubytter.new(OAuth::AccessToken.new consumer, session[:token], session[:secret])
    end
    content_type :json
    rubytter.friends_timeline(:count => 200).to_a.map{|status|
      status[:yomi] = NKF.nkf("-w --hiragana", MeCab::Tagger.new("-O yomi").parse(status.text)).chomp
      status
    }.to_json
  end

  get '/auth/twitter/callback' do
    auth = request.env["omniauth.auth"]
    pp auth
    session[:user] = auth["user_info"]["nickname"]
    session[:token] = auth["credentials"]["token"]
    session[:secret] = auth["credentials"]["secret"]
    redirect '/game'
  end

  get '/game' do
    @screen_name = session[:user]
    erb :game
  end

  post '/logout' do
    session.delete :user
    session.delete :token
    session.delete :secret
    ""
  end
end
