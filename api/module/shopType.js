const db=require('./db')
// const mongodb=require('mongodb')
const tools=require('./tools')
const {upPic}=require('./upPic')
module.exports.addShopType=async function(req,res){
    const status=await upPic(req,"shopTypePic");
    if(status.ok===1){
        db.insertOne("shopTypeList",{
            goodstypename:status.params.shopTypeName,
            goodstypepic:status.params.newPicName,
            createtime:Date.now()
        })
    }
    tools.json(res,1,"okk")
}
module.exports.getShopTypeList=async function(req,res){
    let pageIndex=req.query.pageIndex/1;
    let pageSum=1;
    let limit=3;
    let whereObj={};
    const goodstypename=req.query.shopTypeName||{};
    if(goodstypename.length>0)
        whereObj.goodstypename=new RegExp(goodstypename);
    const count=await db.count("shopTypeList",whereObj);
    pageSum=Math.ceil(count/limit);
    if(pageSum<1)
        pageSum=1;
    if(pageIndex>pageSum)
        pageIndex=pageSum;
    if(pageIndex<1) 
        pageIndex=1;
    const shopTypeList=await db.find("shopTypeList",{
        whereObj,
        sortObj:{
            createtime:-1
        },
        skip:(pageIndex-1)*limit,
        limit
    });
    setTimeout(() => {
        res.json({
            ok:1,
            shopTypeList,
            pageIndex,
            pageSum
        })
    }, 500);
}
module.exports.getallShopTypeList=async function(req,res){
    const shopTypeList=await db.find("shopTypeList",{
        sortObj:{
            createTime:-1
        }
    });
    res.json({
        ok:1,
        shopTypeList
    })
}
module.exports.getShopTypeById=async function(req,res){
    const shopTypeInfo=await db.findOneById("shopTypeList",req.query.shopTypeId);
    res.json({
        ok:1,
        shopTypeInfo
    })
}
module.exports.putShopTypeList=async function(req,res){
    const {ok,params}=await upPic(req,"shopTypePic");
    if(ok===-1){
        tools.json(res);
    }else{
        const $set={
            goodstypename:params.shopTypeName,
            createtime:Date.now()
        }
        if(ok===1){
            $set.goodstypepic=params.newPicName
        }
        await db.updateOneById("shopTypeList",params.shopTypeId,{$set});
        res.json({
            ok:1,
            msg:"okkk"
        })
    }
}