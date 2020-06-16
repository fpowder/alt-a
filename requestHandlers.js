module.exports = (app, bodyParser) => {

     app.get('/', (req, res) => {
        res.render('index.html');
     });

}