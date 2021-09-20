const checkdelay = 10; // in seconds
// const discordbot = {
//   "url": "https://discord.com/api/webhooks/888939788772708382/YBuLYgyT4hCEgK53M5h1xWVHGt6JIIcyxSBNX5sNszipdvo1j4kxfilRP3fgXcDEtnAO",
//   "name": "crypto_bot"
// };
// debug
const discordbot = {
  "url": "https://discord.com/api/webhooks/889300799593791510/B3fJ8cN674_RKpTbXC2U0SU6rQorlhs-lrRTwskpVtCukYzHlDbaQpT-9Vh6KBym-pfD",
  "name": "debug_bot"
};

let exchange   = "binance";
let cripto     = "dogecoin";
let lastSended = null;
let canSend    = true;

$("#exchange").change(function() {
  exchange = $(this).val();
});


function notify(msg) {
  $(".notification").html(msg);
}

function toggleSend() {
  $(".load-btn").toggleClass("active");
  canSend = !canSend;
}

function getAPIInfo(cripto="dogecoin") {
  let apiInfo = {};

  switch(cripto){
    case 'dogecoin':
      $.ajax({
        "url": "https://sochain.com//api/v2/get_price/DOGE/USD",
        "method": "GET",
        "async": false,
        "success": function(res){
          let info = res.data.prices.filter(d => d.exchange == exchange)[0];
          apiInfo.price      = info.price;
          apiInfo.price_base = info.price_base;
          apiInfo.notify     = `<span style="color: #1E3D58">Actual price is</span> ${info.price_base} ${info.price}`;
        }
      });
      break;
    default:
      apiInfo.price      = null;
      apiInfo.price_base = null;
      apiInfo.notify     = `Any API found for '${cripto}'.`;
  }

  return apiInfo;
}

function sendMessage(title, msg) {
  let params = {
    "username"  : discordbot.name,
    "avatar_url": "https://i.imgur.com/qxbCmbg.png",
    "content"   : `@here`,
    "embeds"    : [
      {
        "title": `${title}`,
        "description": `${msg}`,
        "color": 16562691
      }
    ]
  }
  let request = new XMLHttpRequest();
  request.open("POST", discordbot.url);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(params));
}

function checkRoutine(forceSend=false) {
  let info = getAPIInfo(cripto); // hardcoded

  // do notify
  notify(info.notify);
  if(!canSend && !forceSend) return;

  let minprice = parseFloat($("#minprice").val());
  let maxprice = parseFloat($("#maxprice").val());
  if(forceSend) {
    let title   = `Price on ${exchange.toUpperCase()} for ${cripto.toUpperCase()} reach ${info.price_base??''} ${info.price??''}`;
    let message = 'FORCE SENDED MESSAGE';
    sendMessage(title, message);
  }
  else {
    if(info.price >= minprice || info.price <= maxprice) {
      let title   = `Price on ${exchange.toUpperCase()} for ${cripto.toUpperCase()} reach ${info.price_base??''} ${info.price??''}`;
      let message = `TIME TO ${info.price >= minprice?'SOLD':'BUY'} SOME ${cripto.toUpperCase()} ON ${exchange.toUpperCase()}!`;
  
      if(lastSended === null) {
        lastSended = info.price;
        sendMessage(title, message);
      }
      else if(lastSended != info.price) {
          lastSended = info.price;
          sendMessage(title, message);
      }
    }
    else {
      lastSended = null;
    }
  }
}


$(document).ready(function(){
  checkRoutine();
  setInterval(() => {
    checkRoutine();
  }, 1000 * checkdelay);
});