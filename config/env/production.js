/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

<<<<<<< HEAD
  models: {
=======
   models: {
>>>>>>> 140f86feda29170d0f7757c30b0cbf241eb8ea22
     connection: 'MongoDB'
   },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/
<<<<<<< HEAD
  port: process.env.PORT || 1337,
 //port: process.env.PORT || 1337,
=======

   port: process.env.PORT || 1337,

>>>>>>> 140f86feda29170d0f7757c30b0cbf241eb8ea22
  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

<<<<<<< HEAD
   log: {
     level: "verbose"
   }
=======
  log: {
     level: "verbose"
  }
>>>>>>> 140f86feda29170d0f7757c30b0cbf241eb8ea22

};
