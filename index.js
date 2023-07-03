//basic code to use one browser instance with puppeteer 
// const puppeteer = require('puppeteer');

// (async () => {
// 	const browser = await puppeteer.launch({headless:false});
// 	const page = await browser.newPage();
// 	await page.goto('https://www.freecodecamp.org/');
//     await page.screenshot({path:'example.png'})
	
// 	await browser.close();
// })();



//fetch infomation from webpages 
const fs= require('fs');
const puppeteer = require('puppeteer');
const { types } = require('util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class scrapedata{
    constructor(title,com,mytype,mrp){
        this._title=title;
        this._com=com;
        this._mytype=mytype;
        this._mrp=mrp;
    }

    set bestprice(bstprc){
        this._bestprice=bstprc;
    }
    get bestPrice(){
        return this._bestprice;
    }
    
}

(async () => {
	const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:false,
        userDataDir: "./tmp"
    })
	const page = await browser.newPage();
	await page.goto('https://www.netmeds.com/catalogsearch/result/bestseller%20product/all?prod_meds%5Bpage%5D=84');

    const productHandles= await page.$$('.ais-InfiniteHits-item .cat-item')
    let item=[]
    const title="";
    const img="";
    const arr=[];
    const com="";
    const bestPrice="";
    let OriginalPrice="";
    for(const producthandle of productHandles){
        try{
            const title = await page.evaluate((el) => el.querySelector(".clsgetname").textContent, producthandle);
            const img = await page.evaluate((el) => el.querySelector(".product-image-photo").getAttribute("src"), producthandle);
            const arr=await producthandle.$$('.gen_drug.ellipsis')
            const types=[];
            for(const ar of arr){
                const typename=await page.evaluate((e)=>e.textContent,ar)
                types.push(typename)
            }
            const com = await page.evaluate((el) => el.querySelector(".drug-varients.ellipsis").textContent, producthandle);
            const bestPrice = await page.evaluate((el) => el.querySelector("#final_price").textContent, producthandle);
            const OriPrice = await producthandle.$('.price');
            if (OriPrice!=undefined) {
                OriginalPrice = await page.evaluate((el) => el.querySelector(".price").textContent, producthandle);
                const obj={
                    Title : title,
                    Image : img,
                    Types: types,
                    Company : com,
                    Best_Price : bestPrice,
                    Original_Price: OriginalPrice
                }
                item.push(obj);
            }
            else{
                const obj={
                    Title : title,
                    Image : img,
                    Types: types,
                    Company : com,
                    Original_Price: "MRP "+ bestPrice
                }
                item.push(obj);
            }
            
        }
        catch(err){
            console.log(err);
        }
        fs.appendFile('result.csv',`${title},${img},${types},${com},${bestPrice},${OriginalPrice}\n`,function(err){
            if(err) throw err;
        })
    }
    console.log(item)
    
    
	await browser.close();
})();