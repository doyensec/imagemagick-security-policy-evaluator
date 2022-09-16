const indexCheckFile = "./index.json";
var checks = [];

var firstScanWithResults = false;

$.ajaxSettings.contents.script = false;

// prod setup
// $.ajaxSetup({ cache: true });
// $.getScript = function(url, callback, cache){
//   $.ajax({
//     type: "GET",
//     url: url,
//     success: callback,
//     dataType: "script",
//     cache: cache
//   });
// };

async function loadScripts() {
	var checksList = await $.getJSON(indexCheckFile);
	for (var checkName in checksList) {
		let check;
		try {
			check = await $.get(checksList[checkName]);
		} catch (e) {
			console.error(`Error while loading "${checkName}" at "${checksList[checkName]}":`);
			console.error(e)
		}
		if (!check.startsWith('<'))
		{
			eval(`var fn = async function ${checkName}(xmlPolicy) {${check}}`);
			checks.push(fn);
		}
	}
}

loadScripts();

$(function() {
     $("#evaluatePolicyBtn").click(function(e) {
     	e.preventDefault();
     	const policyTextArea = $("#inputPolicy");
     	$('#results').slideUp(200).html("").slideDown(200, function() {
 		var xmlPolicy;
     	if (xmlPolicy = basicValidationIsOk(policyTextArea)) {
     		$(".mainResultsPage").removeClass("d-none").slideDown();
     		console.log("Policy body seems fine, that's good!")
     		startScan(xmlPolicy);
	        $('html, body').animate({
		        scrollTop: $(".mainResultsPage").offset().top
		    }, 0);
     	} else {
     		console.log("Parsing error")
     		return;
     	}
      	});
    });
});

async function startScan(xmlPolicy) {
	if (!checks) {
		await loadScripts();
	}
	var allResults = [];
	for (var i in checks)
	{
		let res = await checks[i](xmlPolicy);
		if (res !== false && (Array.isArray(res) && res.length > 0) || (typeof res["title"] !== "undefined")) {
			allResults.push(res);
			printResults(res);
			firstScanWithResults = true;
		}
	}
	if (allResults.length == 0) {
		printNoFindings();
	}
}

function printNoFindings() {
	var template = `<div class="col-md-6 gx-5 mb-5">
	                    <div class="swal2-icon swal2-success swal2-icon-show" style="display: flex;">
	                      <div class="swal2-success-circular-line-left" style="background-color: rgb(255, 255, 255);"></div>
						  <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>
						  <div class="swal2-success-ring"></div> <div class="swal2-success-fix" style="background-color: rgb(255, 255, 255);"></div>
						  <div class="swal2-success-circular-line-right" style="background-color: rgb(255, 255, 255);"></div>
						</div>
	                </div>	

	                <div class="col-md-6 gx-5">
	                  <h5><strong>The policy is healthy!</strong></h5>
	                  <p class="text-muted">
	                    We could not identify any dangerous directives in your policy. Make sure to harden your environment following the suggestions below.
	                  </p>
	                </div>`;	

	$('#results').append(template);
}

function printResults(results) {


	if (!Array.isArray(results))
		results = [results];

	for (var result of results) {
		let escapedLine = $('<div/>').text(result.line).html();
		let escapedTitle = $('<div/>').text(result.title).html();	

		var template = `<div class="col-md-6 gx-5 mb-4">
	                  <p class="text-muted align-middle">
	                    <code>${escapedLine}</code>
	                  </p>
	                </div>	

	                <div class="col-md-6 gx-5 mb-4">
	                  <h5><strong>${escapedTitle}</strong></h5>
	                  <p class="text-muted">
	                    ${result.description}
	                  </p>
	                </div>`;	

	    $('#results').append(template);
	}
}
	
function basicValidationIsOk(policyTextArea) {
	var policy = policyTextArea.val().trim();
	var xmlPolicy;
	if (policy === "") {
		showParsingErrorToast("Your policy is either invalid or could not be parsed! Try again");
		return false;
	}
	try {
		xmlPolicy = parseXml(policy).toJSON();
		if (!xmlPolicy || xmlPolicy.type !== "document" || !xmlPolicy.children || xmlPolicy.children.length === 0 || !xmlPolicy.children[0] || xmlPolicy.children[0].isRootNode == false)
			throw "Your policy is either invalid or could not be parsed! Try again";
		else if (xmlPolicy.children[0].name !== "policymap")
			throw "Could not find the mandatory policymap root element!";
	} catch(e) {
		let escapedMessage = $('<div/>').text(e.toString()).html()
		showParsingErrorToast(escapedMessage.replaceAll('\n',"<br/>"));
		return false;
	}

	return xmlPolicy.children[0];
}

function showParsingErrorToast(htmlMessage) {

      const toast = document.createElement('div');
      toast.innerHTML = `
        <div class="toast-header toast-warning">
          <strong class="me-auto">Parsing error!</strong>
          <button
            type="button"
            class="btn-close"
            data-mdb-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body text-start">
          ${htmlMessage}
        </div>
      `;

      toast.classList.add('toast', 'fade');

      document.getElementById('stacking-container').appendChild(toast);

      const toastInstance = new mdb.Toast(toast, {
        stacking: true,
        hidden: true,
        width: '450px',
        position: 'top-right',
        container: '#stacking-container',
        autohide: true,
        delay: 3000,
      });

      toastInstance.show();
}