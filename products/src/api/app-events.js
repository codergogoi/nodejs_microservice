 
module.exports = (app) => {
     
    app.use('/app-events', async (req,res,next) => {

        const { payload } = req.body;

        console.log("===============  Products Service Received Event ====== ");
        return res.status(200).json(payload);

    });

}