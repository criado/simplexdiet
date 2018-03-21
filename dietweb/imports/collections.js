import { Mongo } from 'meteor/mongo';

export const Foods = new Mongo.Collection('foods');
// // export const Preferences = new Mongo.Collection('preferences');
// // export const Profiles = new Mongo.Collection('profiles');
//
import { FilesCollection } from 'meteor/ostrio:files';

let foodspath = process.env['METEOR_SHELL_DIR'] + '/../../../private/foods/';

export const FoodFiles = new FilesCollection({
  collectionName: 'FoodFiles',
  storagePath: foodspath,
  // allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
      // Allow upload files under 10MB, and only in png/jpg/jpeg formats
      if (file.size <= 10485760 && /csv/i.test(file.extension)) {
        return true;
      } else {
        return 'Please upload csv, with size equal or less than 10MB';
      }
  },
  onAfterUpload(file) {
    Meteor.call('addfood', [file])
    return true;
  }
});
