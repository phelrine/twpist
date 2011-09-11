require 'bundler/setup'
require 'sinatra/base'
require 'omniauth'
require 'rubytter'
require 'json'
require 'nkf'
require 'MeCab'


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
      @consumer ||= OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET, site: "https://api.twitter.com/")
    end
  end
  
  get '/' do
    "twpist<br><a href='/auth/twitter'>twitter</a><br>"
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
    puts auth
    session[:user] = auth["uid"]
    session[:token] = auth["credentials"]["token"]
    session[:secret] = auth["credentials"]["secret"]
    redirect '/game.html'
  end
end
