// const querystring =require ("querystring")//内置模块
// //1 将对象转为，urlencode
// const obj={
//     a:1,
//     b:2
// }
// console.log(querystring.stringify(obj));
// // a=1&b=2

// //将urlencode转换为对象
// const str="c=3&d=4";
// console.log(querystring.parse(str));

const tools=require("./module/tools");
tools.send("15635411064")
.then(res=>{
    console.log(222222,res);
}).catch(err=>{
    console.log(3333,err);
})