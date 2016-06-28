module.exports.email = {
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
 	templateDir: 'views/emailTemplates',
   	from: 'noreply@visualmail.com',
    testMode: false
 //ssl: true
}

