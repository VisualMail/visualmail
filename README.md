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
