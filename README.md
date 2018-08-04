# Twpist

## デプロイ

herokuへのデプロイ手順

```bash
$ cp .env.sample .env
$ vi .env
$ heroku create -a <アプリ名>
$ heroku buildpacks:set heroku/ruby
$ heroku buildpacks:add --index 1 https://github.com/diasks2/heroku-buildpack-mecab.git
$ heroku config:set LD_LIBRARY_PATH=/app/vendor/mecab/lib
$ heroku plugins:install heroku-config
$ heroku config:push
$ git push heroku master
```