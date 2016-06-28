module.exports.email = {
service: 'Mailgun',
 auth: {
 user: 'postmaster@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org', 
 pass: 'visualmail2016'
 },
 templateDir: 'views/emailTemplates',
 from: 'noreply.visualmail@gmail.com',
 testMode: true,
 ssl: true

 /*service: 'Mailgun',
 auth: {
 user: 'postmaster@app861ea74e5a0e4900a1ede12f23e2e12b.mailgun.org', 
 pass: 'visualmail2016'
 },
 templateDir: 'views/emailTemplates',
 from: 'noreply.visualmail@gmail.com',
 testMode: false,
 ssl: true*/

}

