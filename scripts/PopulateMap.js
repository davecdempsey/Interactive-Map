document.getElementById('files').addEventListener('change', handleJSONFileSelect, false);

function handleJSONFileSelect(evt) {
	var files = evt.target.files; // FileList object
	console.log(evt.target.files);
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				// console.log('e readAsText = ', e);
				// console.log('e readAsText target = ', e.target);
				try {
					json = JSON.parse(e.target.result);
                    // alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(json));

                    console.log(json);
                    handle(json);
				} catch (ex) {
					// alert('ex when trying to parse json = ' + ex);
				}
			}
		})(f);
		reader.readAsText(f);
	}
}