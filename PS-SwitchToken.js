javascript: (function() {

    function switchtoken() {

        function make_field(part, size) {
            return String.fromCharCode(part.length + size) + part;
        }

        function calcHash(hexText, outputType) {
            try {
                var shaObj = new jsSHA("SHA-1", "HEX");
                shaObj.update(hexText);
                var hash = shaObj.getHash(outputType);
                return hash;
            } catch (e) {
                return e.message;
            }
        }

        function toHexString(byteArray) {
            return Array.from(byteArray, function(byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('')
        }

        function encode(s, et) {
            var charCodeArray = new Uint8Array(new ArrayBuffer(s.length));
            for (i = 0; i < s.length; i++) {
                charCodeArray[i] = s.charCodeAt(i);
            }
            return Encoding.convert(charCodeArray, {
                to: et,
                from: 'UTF8'
            });
        }

        var psToken = document.cookie.match(new RegExp('PS_TOKEN=([^;]+)'));

        if (!psToken) {
            psToken = prompt('PS_TOKEN cookie not detected in browser. Input a valid PS_TOKEN:');
        } else {
            psToken = psToken[1];
            var auto = true;
        }

        var full_str = atob(psToken);

        var compressedRaw = '';
        for (i = 76; i < full_str.length; i++) {
            compressedRaw += full_str[i];
        }

        var encoding = '';
        for (i = 4; i < 8; i++) {
            encoding += ('00' + full_str.charCodeAt(i).toString(16)).slice(-2);
        }

        var sha_mac = '';
        for (i = 44; i < 64; i++) {
            sha_mac += ('00' + full_str.charCodeAt(i).toString(16)).slice(-2);
        }

        try {
            var data = pako.inflate(compressedRaw);
        } catch (e) {
            alert("Invalid or unsupported token format");
            return;
        }

        if (encoding == '04030201') {
            var enc = 'UTF16LE';
        } else {
            var enc = 'UTF16BE';
        }

        var strData = String.fromCharCode.apply(null, data);
        var loc = 21;

        var origUser = strData.substring(loc, loc + data[loc - 1]).replace(/\x00/g, '');

        loc = loc + data[20] + 1;
        var lang = strData.substring(loc, loc + data[loc - 1]).replace(/\x00/g, '');

        loc = loc + data[loc - 1] + 1;
        var node = strData.substring(loc, loc + data[loc - 1]).replace(/\x00/g, '');

        loc = loc + data[loc - 1] + 1;
        var time = strData.substring(loc, loc + data[loc - 1]).replace(/\x00/g, '');

        /* Change this to the node's password if you do not want to be prompted for a password */
        var password = 'PS';
        var errMsg = '';

        while (true) {
            if (calcHash(toHexString(data) + toHexString(encode(password, 'UTF16LE')), 'HEX') == sha_mac) {
                break;
            } else {
                var password = prompt(errMsg + 'Input the ' + node + ' Node password: ');
                errMsg = 'Incorrect password. ';
            }
        }

        var user = prompt('Input a valid user ID (Current User = ' + origUser + '):');

        var token_ver = '8.10';
        var unknown_field = 'N';
        user = String.fromCharCode.apply(null, encode(user, enc));
        lang = String.fromCharCode.apply(null, encode(lang, enc));
        node = String.fromCharCode.apply(null, encode(node, enc));
        time = String.fromCharCode.apply(null, encode(time, enc));
        password = encode(password, 'UTF16LE');
        token_ver = String.fromCharCode.apply(null, encode(token_ver, enc));
        unknown_field = String.fromCharCode.apply(null, encode(unknown_field, enc));

        if (enc = 'UTF16LE') {
            var uncompressed_data = '\x00\x00\x00\x04\x03\x02\x01\x01\x00\x00\x00\xbc\x02\x00\x00\x00\x00\x00\x00' + make_field(user, 0) + make_field(lang, 0) + make_field(node, 0) + make_field(time, 0) + '\x00';
            var uncompressed_field = make_field(uncompressed_data, 1);
        } else {
            var uncompressed_data = '\x01\x02\x03\x04\x00\x01\x00\x00\x00\x00\x02\xbc\x00\x00\x00\x00' + make_field(user, 0) + make_field(lang, 0) + make_field(node, 0) + make_field(time, 0) + '\x00';
            var uncompressed_field = '\x00\x00\x00' + make_field(uncompressed_data, 4);
        }

        var charCodeArray = new Uint8Array(new ArrayBuffer(uncompressed_field.length));
        for (i = 0; i < uncompressed_field.length; i++) {
            charCodeArray[i] = uncompressed_field.charCodeAt(i);
        }

        var inflate_data = String.fromCharCode.apply(null, pako.deflate(charCodeArray));
        var sha1_mac = calcHash(toHexString(charCodeArray) + toHexString(password), 'BYTES');
        var uncompressed_length = String.fromCharCode(uncompressed_field.length);

        if (enc = 'UTF16LE') {
            var static_headers1 = '\x00\x00\x00\x04\x03\x02\x01\x01\x00\x00\x00\xbc\x02\x00\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x04\x00\x53\x68\x64\x72\x02' + unknown_field + uncompressed_length + '\x08' + token_ver + '\x14';
            var static_headers2 = '\x00\x00\x00\x05\x00\x53\x64\x61\x74\x61';
            var body = make_field(static_headers2 + make_field(inflate_data, 0), 1);
            var token = make_field(static_headers1 + sha1_mac + body, 1);
        } else {
            var static_headers1 = '\x01\x02\x03\x04\x00\x01\x00\x00\x00\x00\x02\xbc\x00\x00\x00\x00\x00\x00\x00\x2c\x00\x04\x53\x68\x64\x72\x02' + unknown_field + uncompressed_length + '\x08' + token_ver + '\x14';
            var static_headers2 = '\x00\x05\x53\x64\x61\x74\x61';
            var body = '\x00\x00\x00' + make_field(static_headers2 + make_field(inflate_data, 0), 4);
            var token = '\x00\x00\x00' + make_field(static_headers1 + sha1_mac + body, 4);
        }

        if (auto) {
            document.cookie = 'PS_TOKEN=' + btoa(token) + '; expires=0; path=/';
            location.reload();
        } else {
            prompt("New PS_TOKEN: ", btoa(token));
        }
    }

    function loadJsDependencies(scriptsCollection, startIndex, librariesLoadedCallback) {
        if (scriptsCollection[startIndex]) {
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", scriptsCollection[startIndex]);
            fileref.onload = function() {
                startIndex = startIndex + 1;
                loadJsDependencies(scriptsCollection, startIndex, librariesLoadedCallback)
            };

            document.getElementsByTagName("head")[0].appendChild(fileref)
        } else {
            librariesLoadedCallback();
        }
    }

    var scriptLibrary = [];
    scriptLibrary.push("https://cdn.jsdelivr.net/npm/pako@1.0.6/dist/pako.min.js");
    scriptLibrary.push("https://cdn.jsdelivr.net/npm/jssha@2.3.1/src/sha.js");
    scriptLibrary.push("https://cdn.jsdelivr.net/npm/encoding-japanese@1.0.28/encoding.min.js");

    loadJsDependencies(scriptLibrary, 0, function() {
        switchtoken();
    });

})()
