module.exports.email = {
/*service: 'Gmail',
  auth: {
          user: 'noreply.visualmail@gmail.com',
          pass: ''
        },
         transporter: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'noreply.visualmail@gmail.com',
                pass: 'visualmail2016'
            },
           // tls: {rejectUnauthorized: false},
            //debug:true          
        },
 	templateDir: path.resolve(sails.config.appPath, 'views/emailTemplates'),
   	from: 'noreply@visualmail.com',
    testMode: false,
     ssl: true
 //ssl: true
*/
 service: 'Mailgun',
 auth: {
 user: 'postmaster@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org', 
 pass: 'visualmail2016'
 },
 templateDir: 'views/emailTemplates',
 from: 'visualmail@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org',
 testMode: false,
 ssl: true


}

