require 'sinatra/base'
require 'json'
require 'nkf'
require 'MeCab'

class TwpistApp < Sinatra::Base
  get '/' do
    "twpist"
  end

  get '/yomi.json' do
    content_type :json
    return {yomi: NKF.nkf("-w --hiragana", MeCab::Tagger.new("-O yomi").parse(params[:text])).chomp}.to_json
  end
end
