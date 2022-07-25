const convert = require('geo-coordinates-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'errConversion');
const conversionErr = [];
let i;

const files = fs.readdirSync(filePath);
// const files = [
//   "Asahan Fall.json",
//   "Ayer Puteh.json",
//   "Jeram Tinggi.json",
//   "Kota Tinggi.json",
//   "Pulai Falls.json",
//   "Puteri Fall.json",
//   "Taka Melor.json",
// ];

function readWriteLoop() {
  for (i = 0; i < files.length - 1; i++) {
    const jsonObj = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'waterfalls', files[i]))
    );

    // if (jsonObj.location.verbatimCoordinates) return;

    const { details } = jsonObj;

    if (details !== undefined) {
      // console.log(details, typeof details);
      // const {
      //   state,
      //   location,
      //   coordinates,
      //   waterSource,
      //   waterfallProfile,
      //   accessibility,
      // } = [details];

      const destrut = details;

      let state;
      let location;
      let coordinates;
      let waterSource;
      let waterfallProfile;
      let accessibility;

      [
        { state },
        { location },
        { coordinates },
        { waterSource },
        { waterfallProfile },
        { accessibility }
      ] = destrut;

      console.log(coordinates);

      // console.log(state);

      jsonObj.state = state;
      jsonObj.location = location;
      jsonObj.coordinates = coordinates;
      jsonObj.waterSource = waterSource;
      jsonObj.waterfallProfile = waterfallProfile;
      jsonObj.accessibility = accessibility;

      let converted;
      try {
        converted = convert(coordinates);
        // console.log(converted);

        jsonObj.location = converted;
        delete jsonObj.details;

        // save file back into orignal collection
        fs.writeFileSync(
          path.join(__dirname, 'data', 'waterfalls', `${files[i]}`),
          JSON.stringify(jsonObj),
          'utf-8'
        );

        // if conversion is successful then delete it from errConversion folder
        fs.unlink(path.join(filePath, `${files[i]}`), function(err) {
          if (err) throw Error;
          console.log('File deleted');
        });

        console.log(
          `${files[i]} has conversion! Moving to next file. File count: ${i}`
        );
      } catch (err) {
        // console.log(err);
        conversionErr.push(files[i]);

        console.log(`${files[i]} coordinates not converted! File count: ${i}`);
      }

      // at the end of loop
      if (i === files.length - 2) {
        saveErrLogs();
      }
    }
  }
}

function saveErrLogs() {
  fs.writeFileSync(
    path.join(__dirname, 'data', 'errConversion', 'conversionErr.json'),
    JSON.stringify(conversionErr)
  );

  console.log(
    'End of files array. Saving files with error in conversion in conversionErr.json'
  );
  return;
}
readWriteLoop();

//   const { coordinates } = jsonObj;
//   let converted;
//   try {
//     // perform conversion
//     converted = convert(coordinates);
//     // save converted values into new property
//     jsonObj.location = converted;
//     // save file
//     fs.writeFileSync(
//       path.join(filePath, files[i]),
//       JSON.stringify(jsonObj)
//     );
//     // advance counter after each file completion
//     counter++;
//     console.log(`${files[i]} converted! File count: ${counter}`);
//     if (i === files.length - 1) {
//       saveErrLogs();
//     }
//   } catch (err) {
//     // push files that are not converted into array
//     conversionErr.push(files[i]);
//     // advance counter to skip file when function is re-run
//     counter++;
//     console.log(
//       `${files[i]} coordinates not converted! File count: ${counter}`
//     );
//     // re-run loop
//     readWriteLoop();
//   }
