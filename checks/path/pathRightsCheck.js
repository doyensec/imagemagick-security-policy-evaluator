if (xmlPolicy) {

	var results = [];

    var potentiallyDangerousRightsArray = [ "read", "write", "execute", "all"];

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.rights &&
        	   e.attributes.pattern &&
               e.attributes.domain == "path"
    })

    if (res.length > 0) { // there's at least a "path" with rights & pattern
    	let insecurePathEntry = res.filter((e) => {
            let rightsDetected = e.attributes.rights.toLowerCase().split('|').map(function (e) {
                return e.trim();
            });
            if (rightsDetected.some((e) => potentiallyDangerousRightsArray.indexOf(e) !== -1))
                return true;
    	});

    	for (var issue of insecurePathEntry)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
	        "title": `A path policy was set to ${issue.attributes.rights}`,
	        "description": `The policy is currently defining a <code>path</code> directive with risky permissions <code>${issue.attributes.rights}</code> for the pattern <code>${issue.attributes.pattern}</code>. This means that an attacker will be able to read text from the paths defined in the pattern (e.g. using <code>caption:@myCaption.txt</code>). If possible, you should deny access to all paths except for the proven safe ones in order to avoid indirect reads.`
	    	});

    	return results;
	} else { // no path is specified
	    return {
	        "line": `<policy domain="path" rights="???" pattern="@???"/>`,
	        "title": "Specify a path policy to deny access to paths",
	        "description": `The policy is missing a <code>path</code> directive with permissions <code>none</code> for the pattern <code>@*</code>. This means that an attacker will be able to read text from arbitrary files (e.g. using <code>caption:@myCaption.txt</code>). If possible, you should deny access to all paths except for the proven safe ones in order to avoid indirect reads.`
        }
	}
}l