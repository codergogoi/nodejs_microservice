const CustomerService = require('../services/customer-service');
const  UserAuth = require('./middlewares/auth');
const { SubscribeMessage } = require('../utils');


module.exports = (app, channel) => {
    
    const service = new CustomerService();

    // To listen
    SubscribeMessage(channel, service);


    app.post('/signup', async (req,res,next) => {
        const { email, password, phone } = req.body;
        const { data } = await service.SignUp({ email, password, phone}); 
        res.json(data);

    });

    app.post('/login',  async (req,res,next) => {
        
        const { email, password } = req.body;

        const { data } = await service.SignIn({ email, password});

        res.json(data);

    });

    app.post('/address', UserAuth, async (req,res,next) => {
        
        const { _id } = req.user;


        const { street, postalCode, city,country } = req.body;

        const { data } = await service.AddNewAddress( _id ,{ street, postalCode, city,country});

        res.json(data);

    });
     

    app.get('/profile', UserAuth ,async (req,res,next) => {

        const { _id } = req.user;
        const { data } = await service.GetProfile({ _id });
        res.json(data);
    });
     

    app.get('/shoping-details', UserAuth, async (req,res,next) => {
        const { _id } = req.user;
       const { data } = await service.GetShopingDetails(_id);

       return res.json(data);
    });
    
    app.get('/wishlist', UserAuth, async (req,res,next) => {
        const { _id } = req.user;
        const { data } = await service.GetWishList( _id);
        return res.status(200).json(data);
    });

    app.get('/whoami', (req,res,next) => {
        return res.status(200).json({msg: '/customer : I am Customer Service'})
    })
}
