/**
 * Module dependencies
 */
const mega = require("megajs");

module.exports = {
  provider: "mega",
  name: "Mega",
  auth: {
    email: {
      label: "Email",
      type: "text",
    },
    password: {
      label: "Password",
      type: "password",
    },
  },
  init: (config) => {
    let storage;

    const promise = new Promise((resolve, reject) => {
      storage = mega({
        email: config.email,
        password: config.password,
      }, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });

    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          promise.then(() => {
            storage.upload({ name: `${file.hash}${file.ext}` }, file.buffer, (err, mutableFile) => {
              if (err) {
                reject(err);
              }

              mutableFile.link(async (err, url) => {
                if (err) {
                  reject(err);
                }

                file.public_id = mutableFile.nodeId;
                file.url = url;

                resolve();
              });
            });
          }).catch((err) => {
            reject(err);
          });
        });
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          promise.then(() => {
            const mutableFile = storage.files[file.public_id];

            mutableFile.delete((err) => {
              if (err) {
                reject(err);
              }

              resolve();
            });
          }).catch((err) => {
            reject(err);
          });
        });
      },
    };
  },
};
