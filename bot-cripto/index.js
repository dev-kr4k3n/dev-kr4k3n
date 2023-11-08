const crypto = require("crypto");
const axios = require("axios");

const SYMBOL = "BTCUSDT";
const QUANTITY = 0.001;
const API_KEY = "ehdheSICxY5i2ku2N9KXDFJo8RO3Xoynvyrv8yOyRtmal9xqnBLU4B85FAzDjv7J";
const SECRET_KEY = "Sxz24ToY55JGNiSUNtYL4fxpe28SbZwGz9fHPRLitZoSf1t9OtdUlmNSuhNSk4EW";

const API_URL = "https://testnet.binance.vision"; //api de testes binance

let isOpened = false;

function calcSMA(data){
    const closes = data.map(candle => parseFloat(candle[4]));
    const sum = closes.reduce((a,b) => a + b);
    return sum / data.length;
}
async function start(){
    //comandos robo

    const {data} = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + price);

    const sma = calcSMA(data);
    console.log("SMA: " + sma);
    console.log("IsOpened ?: " + isOpened);

    if (price <= (sma * 0.9) && isOpened == false){
        console.log("comprar");
        isOpened = true;
        newOrder(SYMBOL, QUANTITY, "buy");
    }    
    else if(price >= ((sma * 1.1)) && isOpened == true){
        console.log("vender");
        newOrder(SYMBOL, QUANTITY, "sell");
        isOpened = false;
    }    
    else
        console.log("aguardando");
}

async function newOrder(symbol, quantity, side){
    const order = {symbol, quantity, side};
    order.type = "MARKET";
    order.timestamps = Date.now();

    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex")

    order.signature = signature;   
    
    try {
        const { data } = await axios.post(
            API_URL + "/api/v3/order",
            new URLSearchParams(order).toString(),
            {
                headers: { "X-MBX-APIKEY": API_KEY }
            });

        console.log(data);
    } catch (err) {
        console.error(err.response.data);
    }
}

setInterval(start,3000);

start();