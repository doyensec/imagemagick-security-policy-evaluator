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
               e.attributes.domain == "filter"
    })

    if (res.length > 0) { // there's at least a "filter" with rights & pattern
    	let insecureFilterEntry = res.filter((e) => {
            let rightsDetected = e.attributes.rights.toLowerCase().split('|').map(function (e) {
                return e.trim();
            });
            if (rightsDetected.some((e) => potentiallyDangerousRightsArray.indexOf(e) !== -1))
                return true;
    	});

    	for (var issue of insecureFilterEntry)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
	        "title": `A filter policy was set to ${issue.attributes.rights}`,
	        "description": `The policy is currently defining a <code>filter</code> directive with risky permissions <code>${issue.attributes.rights}</code> for the pattern <code>${issue.attributes.pattern}</code>. If possible, you should deny access to all filters except for the proven safe types.`
	    	});

    	return results;
	} else { // no filter is specified
	    return {
	        "line": `<policy domain="filter" rights="???" pattern="???"/>`,
	        "title": "Specify a filter policy to deny access to filters",
	        "description": `The policy is missing a <code>filter</code> directive with permissions <code>none</code> for the pattern <code>*</code>. If possible, you should deny access to all filters except for the proven safe types.`
        }
	}
}l