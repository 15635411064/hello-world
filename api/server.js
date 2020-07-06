const express=require('express')
const bodyParser=require('body-parser')
const db=require('./module/db')
const mongodb=require('mongodb')
const tools=require('./module/tools')
const {upPic}=require('./module/upPic')
const shopType=require('./module/shopType')
const app=express();
app.use(bodyParser.json())
app.use(express.static(__dirname+"/upload"))
// let adminInfo=null;
app.post('/login',async function(req,res){
    console.log(req.body);
    
    const {adminName,password}=req.body;    
    const results=await db.findOne("adminList",{
        adminName,
        password
    })
    console.log(results);
    
    if(results){
        await db.insertOne("adminLog",{
            adminId:results._id,
            adminName:results.adminName,
            loginTime:Date.now()
        })
        res.json({
            ok:1,
            adminName:results.adminName,
            token:tools.encode({
                adminName:results.adminName
            })
        })
    }else{
        tools.json(res,-1,"输入正确的账号密码")
    }
})
app.all("*",function(req,res,next){
    const deResult=tools.decode(req.headers.authorization);
    console.log(deResult.ok,555555555555);
    
    if(deResult.ok===3){
        adminInfo=deResult.info;
        next();
    }else{
        tools.json(res,2,"err token")
    }
})
app.get("/adminLog",async function(req,res){
    const adminName="admin";
    let pageIndex=req.query.pageIndex/1;
    let pageSum=1;
    let limit=5;
    const count=await db.count("adminLog",{
        adminName
    });
    pageSum=Math.ceil(count/limit);
    if(pageSum<1)
        pageSum=1;
    if(pageIndex>pageSum)
        pageIndex=pageSum;
    if(pageIndex<1)
        pageIndex=1;
    const adminLog=await db.find("adminLog",{
        whereObj:{
            adminName
        },
        sortObj:{
            loginTime:-1
        },
        skip:(pageIndex-1)*limit,
        limit
    });
    setTimeout(() => {
        res.json({
            ok:1,
            adminLog,
            pageIndex,
            pageSum
        })
    }, 500);
})
//type
app.post("/shopType",shopType.addShopType)
app.get("/shopTypeList",shopType.getShopTypeList)
app.get("/allShopTypeList",shopType.getallShopTypeList)
app.get("/getShopTypeById",shopType.getShopTypeById)
app.put("/putshopTypeList",shopType.putShopTypeList)
//shop
app.post("/shopList",async function(req,res){
    const {ok,params}=await upPic(req,"shopPic");
    if(ok===1){
        const shopType=await db.findOneById("shopTypeList",params.shopTypeId);
        db.insertOne("shopList",{
            shopName:params.shopName,
            shopPic:params.newPicName,
            createTime:Date.now(),
            isTop:params.isTop==="true",
            shopTypeName:shopType.shopTypeName,
            shopTypeId:shopType._id
        })
    }
    tools.json(res,1,"okk")
})
app.get("/shopList",async function(req,res){
    const deResult=tools.decode(req.headers.authorization);
    if(deResult.ok===3){
        let pageIndex=req.query.pageIndex/1;
        let pageSum=1;
        let limit=3;
        let whereObj={};
        if(req.query.shopTypeId.length>0)
            whereObj.shopTypeId=mongodb.ObjectId(req.query.shopTypeId);
        const count=await db.count("shopList",whereObj);
        pageSum=Math.ceil(count/limit);
        if(pageSum<1)
            pageSum=1;
        if(pageIndex>pageSum)
            pageIndex=pageSum;
        if(pageIndex<1) 
            pageIndex=1;
        const shopList=await db.find("shopList",{
            whereObj,
            sortObj:{
                createTime:-1
            },
            skip:(pageIndex-1)*limit,
            limit
        });
        setTimeout(() => {
            res.json({
                ok:1,
                shopList,
                pageIndex,
                pageSum
            })
        }, 500);
    }else{
        tools.json(res,2,"err")
    }
})
app.get("/shopListById/:shopTypeId",async function(req,res){
    const shopTypeId=mongodb.ObjectId(req.params.shopTypeId);
    const shopList=await db.find("shopList",{
        whereObj:{
            shopTypeId
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
//goods
app.get("/goodsType",async function(req,res){
    const deResult=tools.decode(req.headers.authorization);
    if(deResult.ok===3){
        let pageIndex=req.query.pageIndex/1;
        let pageSum=1;
        let limit=3;
        let whereObj={};
        // if(req.query.shopTypeId.length>0)
        //     whereObj.shopTypeId=mongodb.ObjectId(req.query.shopTypeId);
        const count=await db.count("goodsTypeList",whereObj);
        pageSum=Math.ceil(count/limit);
        if(pageSum<1)
            pageSum=1;
        if(pageIndex>pageSum)
            pageIndex=pageSum;
        if(pageIndex<1) 
            pageIndex=1;
        const shopList=await db.find("goodsTypeList",{
            whereObj,
            sortObj:{
                createTime:-1
            },
            skip:(pageIndex-1)*limit,
            limit
        });
        setTimeout(() => {
            res.json({
                ok:1,
                shopList,
                pageIndex,
                pageSum
            })
        }, 500);
    }else{
        tools.json(res,2,"err")
    }
})
app.post("/goodsTypeList",async function(req,res){
    const {_id,shopName,shopTypeId,shopTypeName}=await db.findOneById("shopList",req.body.shopId);
    await db.insertOne("goodsTypeList",{
        goodsTypeName:req.body.goodsTypeName,
        shopId:_id,
        shopName,
        shopTypeId,
        shopTypeName,
        createTime:Date.now()
    });
    res.json({
        ok:1,
        msg:"okk"
    })
})
app.listen(80,function(){
    console.log('success')
})