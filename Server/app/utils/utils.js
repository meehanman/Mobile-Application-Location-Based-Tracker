module.exports = function(server) {

    server.stringGen = function(len) {
        var text = "";
        var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < len; i++) {
            text += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return text;
    }
    //Test image code to be replaced by storing images in the db
    server.upload = function(imageRaw, saveImageCallback) {
        if (imageRaw == undefined) {
            return false;
        }

        var imageBuffer = decodeBase64Image(imageRaw);
        if (imageBuffer.type.split("/")[0] == "image") {
            var filename = server.stringGen(10);
            server.fs.writeFile('/var/www/html/images/' + filename + '.' + imageBuffer.type.split("/")[1], imageBuffer.data, function(err) {
                if (err) {
                    saveImageCallback(false);
                }
                var returnUrl = "http://cloud.dean.technology/images/" + filename + '.' + imageBuffer.type.split("/")[1];
                console.log(returnUrl);
                saveImageCallback(returnUrl);
            });
        }

        function decodeBase64Image(dataString) {
            //TODO: Check this input begins with data: and contains the base64 bit

            var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                response = {};

            console.log(matches[0], matches[1], matches[2]);

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');

            return response;
        }
    };
}
