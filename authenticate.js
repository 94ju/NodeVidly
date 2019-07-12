function autheticate(req,res,next){
    console.log("Authenticated...");
    next();
}
module.exports=autheticate;
