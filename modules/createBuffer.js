const fs = require("fs");

// create a folder called buffer
function createBuffer() {
    const path = "./buffer";

    fs.access(path, (error) => {
        // To check if the given directory  
        // already exists or not 
        if (error) {
            // If current directory does not exist 
            // then create it 
            fs.mkdir(path, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("New Directory created successfully !!");
                }
            });
        } else {
            console.log("Given Directory already exists !!");
        }
    });

}

module.exports = createBuffer
