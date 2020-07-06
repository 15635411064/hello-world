const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const tools = require("./module/tools")
const db = require("./module/db")
app.use(bodyParser.json());
app.use(express.static(__dirname+"/upload"))
app.get("/send", async function (req, res) {
    const phoneId = req.query.phoneId;
    const code = tools.getRandom(100000, 999999);
    const info = await db.findOne("phoneCode", {
        phoneId,
        code
    })
    if (info) {
        if (Date.now() - info.sendTime > 5 * 60 * 1000) {
            //可以重发  过期
            // const code =await tools.send(phoneId)
            // await tools.send(phoneId, code)
            await db.updateOne("phoneCode", { _id: info._id }, { $set: { sendTime: Date.now(), code } })
            res.json({
                ok: 1,
                msg: "成功",
                code
            })
        } else {
            tools.json(res, -1, "时间未到还差" + Number.parseInt((1000 * 60 * 5 - (Date.now() - info.sendTime))) / 1000 + "秒")
        }
    } else {
        //无记录
        //  const code =await tools.send(phoneId)
        // await tools.send(phoneId, code)
        await db.insertOne("phoneCode", {
            phoneId,
            code,
            sendTime: Date.now()
        })
        res.json({
            ok: 1,
            msg: "成功",
            code
        })
    }
})
app.post("/login", async function (req, res) {
    const { phoneId, code } = req.body;
    console.log(req.body);
    // await  db.insertOne("phoneCode", {
    //     phoneId,
    //     code
    // })
    const info = await db.findOne("phoneCode", {
        phoneId,
        code: code / 1
    })
    console.log(info);
    if (info) {
        if (Date.now() - info.sendTime > 1000 * 60 * 5) {
            tools.json(res, -1, "验证码过期了，请从新发送")
        } else {
            const user = await db.findOne("userLst", {
                phoneId
            })
            if (user) {
                await db.updateOne("userLst", {
                    phoneId
                },
                    {
                        $set: {
                            loginTime: Date.now()
                        }
                    })
                res.json({
                    ok: 1,
                    msg: "登陆成功"
                })
            } else {
                await db.insertOne("userList", {
                    phoneId,
                    loginTime: Date.now(),
                    regTime: Date.now(),
                    moneySum: 100000
                })
                res.json({
                    ok: 1,
                    msg: "成功"
                })
            }
        }
    } else {
        tools.json(res, -1, "验证码错误")
    }
})
app.get("/search", async function (req, res) {
    console.log(req.query);
    
    const keyword = req.query.keyword;
    const shopList=await db.find("shopList", {
        whereObj: {
            shopName: new RegExp(keyword)
        },
        sortObj:{
            createTime:-1
        }
    });
    res.json({
        ok:1,
        shopList
    })
})
app.get("/shopTypeList", async function (req, res) {
    // console.log(req.query);
    const limit = (req.query.limit || 60)/1
    const shopTypeList=await db.find("shopTypeList", {
        limit,
        sortObj:{
            createTime:-1
        }
    });
    res.json({
        ok:1,
        shopTypeList:tools.changeArr(shopTypeList,)
    })
})
app.get("/shopList", async function (req, res) {
    const pageIndex=req.query.pageIndex/1;
    let pageSum=1;
    let limit=7;
    const count=await db.count ("shopList");
    pageSum=Math.ceil(count/limit);
    if(pageSum<1){
        pageSum=1
    }
    if(pageIndex>pageSum){
        pageIndex=pageSum
    }
    if(pageIndex<1){
        pageIndex=1
    }
    const shopList=await db.find("shopList", {
        sortObj:{
            createtime:-1
        },
        skip:(pageIndex-1)*limit,
        limit,
    });
    setTimeout(()=>{
        res.json({
        ok:1,
        shopList,
        pageSum,
        pageIndex
    })
    },1000)
    
})
app.listen(8088, function () {
    console.log("success");
})