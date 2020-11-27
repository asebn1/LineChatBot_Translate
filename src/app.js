var express = require('express');
const request = require('request');
const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const TOKEN = '2JxlCY2uInyoOWBCzvIIYpNzVWhS8d2NsJb3EJXkUSb4XMkZiE6gLHr1d+Incb8TubVUf43Rm07ZCte/HkLpLdi7wBHC01SVEtn5R5K0c3laxcdMONtsfsI6T/tTPLjndFE3ZIIqxAxKCu4DamIM+QdB04t89/1O/w1cDnyilFU='
const PAPAGO_URL = 'https://openapi.naver.com/v1/papago/n2mt'
const PAPAGO_ID = 'CrQaOJjBTYXiXgl2SRLW'
const PAPAGO_SECRET = 'iZ3rlh070P'
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "www.ossjaeho.ml"
const sslport = 23023;
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.post('/hook', function (req, res) {

    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date() ,'======================');
    console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);

    trans(eventObj.replyToken, eventObj.message.text);
    

    res.sendStatus(200);
});

function trans(replyToken, message) {
    if (message=="영어"){
        lang1 = "en";
    }
    else if(message=="일본어"){
        lang1 = "ja";
    }
    else if(message=="프랑스어"){
        lang1 = "fr";
    }
    else{
        request.post(
            {
                url: PAPAGO_URL,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Naver-Client-Id': `${PAPAGO_ID}`,
                    'X-Naver-Client-Secret': `${PAPAGO_SECRET}`
                },
                body: `source=ko&target=${lang1}&text=` + message,
                json:true
            },(error, response, body) => {
                if(!error && response.statusCode == 200) {
                    console.log(body.message);
                    var transMessage = body.message.result.translatedText;
                    request.post(
                        {
                            url: TARGET_URL,
                            headers: {
                                'Authorization': `Bearer ${TOKEN}`
                            },
                            json: {
                                "replyToken":replyToken,
                                "messages":[
                                    {
                                        "type":"text",
                                        "text":transMessage
                                    }
                                ]
                            }
                        },(error, response, body) => {
                            console.log(body)
                        });
                }
            });
    }
    

}

try {
    const option = {
      ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
      key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };
  
    HTTPS.createServer(option, app).listen(sslport, () => {
      console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
  } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
  }
  