// const md5=require("md5");
// const password=444444444;
// const str="55";
// console.log(md5(password+str));


// db.adminList.insert({adminName:"znn",password:"49ac6ad9f70e81460a57bb33a2c21d73"})
const arr=[1,2,3,6,4,5,9,7,8,10,11];
let newArr=[];
for(var i=0;i<arr.length;i+=5){
    newArr.push(arr.slice(i,i+5))
}
console.log(newArr);
