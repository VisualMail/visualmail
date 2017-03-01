# VisualMail

Proyecto de comunicación para grupos colaboartivos

Especificaciones:

Server:
Sails js
MongoDB

Cliente:
Angularjs
Angular-Materialize

Para realizar pruebas en "localhost" ingresar en el archivo "config/connections.js" y descomentar la línea
  
 /*localDiskDb: { 
   adapter: 'sails-disk'
 },*/

Comentar la línea

  MongoDB: { 
    adapter: "sails-mongo", 
    url: "mongodb://matias:prueba@ds017514.mlab.com:17514/visualmailtest"
  },

 Descomentar la línea 

   /*MongoDB: {
    adapter: "sails-mongo",
    host: "localhost",
    port: 27017,
    user: "", //optional
    password: "", //optional
    database: 'VisualMail_2' //optional
  },*/


En el archivo config/model cambiar reemplazar lo siguiente:

connection: "MongoDB"
migrate: "safe"

En el archivo /config/env/production.js de-comentar models y en el valor de "someMysqlServer" cambiar por "MongoDB" y en el valor de port, cambiar el valor por: "port: process.env.PORT || 1337"

Cambiar en el archivo “package.json” lo siguiente:

"scripts": {
  "debug": "node debug app.js",
  "start": "node app.js"
},

por

"scripts": {
  "start": "sails lift",
  "debug": "node debug app.js"
},
