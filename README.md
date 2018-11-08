# PS-SwitchToken

A JavaScript bookmarklet that allows you to seamlessly switch users during a PeopleSoft session.


### Requirements
- You must know the node password for the environment that you want to switch users in.

- The environment must have Switch User functionality enabled (PeopleTools > Utilities > Administration > PeopleTools Options).  The `Enable Switch User` value must be set to `All` or `Some`.  If the value is set to `Some`, then you need to check the `Allow Switch User` box on the User Profile (PeopleTools > Security > User Profiles > User Profiles) for the users that you want to switch between.

### How to Use
Add the [PS-SwitchToken](javascript:(function()%7Bfunction%20callback%28%29%7BparseTT%28%29%7Dvar%20s%3Ddocument.createElement%28%22script%22%29%3Bs.src%3D%22https%3A%2F%2Fcoltonfischer.github.io%2FPS-SwitchToken%2FPS-SwitchToken.js%22%3Bif%28s.addEventListener%29%7Bs.addEventListener%28%22load%22%2Ccallback%2Cfalse%29%7Delse%20if%28s.readyState%29%7Bs.onreadystatechange%3Dcallback%7Ddocument.body.appendChild%28s%29%3B%7D)()) bookmarklet to your browser’s bookmarks, login to the PeopleSoft web interface (PIA) and click the bookmarklet.  Alternatively, you can invoke the JavaScript code in your browser's dev console in a PeopleSoft session. 

-	Input the node password
-	Input the User ID that you want to switch to and click OK

The page will refresh and you will be authenticated as the new user if the script was successful.

_tip_: If you do not want to input the node password each time, then you can hardcode the password on [this line of the code](https://github.com/coltonfischer/PS-SwitchToken/blob/master/PS-SwitchToken.js#L91).

Demo:

[![PS-SwitchToken Demo](http://www.peoplesoftmods.com/Images/PS-SwitchToken_Demo.gif)]

### Troubleshooting
- This utility is unable to work with certain formats of the PS_TOKEN.  If you have an unsupported format, then the script will output `Invalid or unsupported token format`.  
- If you are taken to the login page with the message `Illegal identity switch has been detected by the System. Please re-login` after invoking the script, then it possible that the user you are logged in as does not have `Switch User` enabled.
- If the new user session does not kick in after invoking the script, then ensure that the User ID is valid and is not locked out.

### Acknowledgements
This utility is merely a JavaScript port of [Alexey Tyurin’s TokenChpoken python script](https://erpscan.com/press-center/blog/peoplesoft-security-part-4-peoplesoft-pentest-using-tokenchpoken-tool/).  Credit and thanks to Alexey and the ERPScan team for their PS_TOKEN research efforts.  

This utility makes use of the following JavaScript libraries: 
- [pako](https://github.com/nodeca/pako)
- [jsSHA](https://github.com/Caligatio/jsSHA)
- [encoding.js](https://github.com/polygonplanet/encoding.js/)
