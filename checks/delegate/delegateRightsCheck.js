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
               e.attributes.domain == "delegate"
    })

    if (res.length > 0) { // there's at least a "delegate" with rights & pattern

        //// LOWERCASE PATTERNS EXIST FINDING

        let undercasePatterns = res.filter((e) => // we check if the patterns are all upper case, since they are case sensitive, see https://github.com/ImageMagick/ImageMagick/issues/4235
            (e.attributes.pattern !== e.attributes.pattern.toUpperCase()) && !(e.attributes.pattern.includes("[") && e.attributes.pattern.includes("]")) // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        for (var issue of undercasePatterns)
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A ${issue.attributes.domain} policy is using lowercase characters in its pattern expression`,
            "description": `The policy is currently defining a <code>${issue.attributes.domain}</code> directive with some lowercase characters in its pattern definition: <code>${issue.attributes.pattern}</code>. Internally, ImageMagick refers to all modules & coders in <a href="https://github.com/ImageMagick/ImageMagick/issues/4235" target="_blank">uppercase</a>. Because of this, this pattern likely won't work as intended. If possible, ensure that the case of the pattern is correct.`
            });

        //// INSECURE PERMISSIONS EXIST FINDING

    	let insecureDelegateEntry = res.filter((e) => {
            let rightsDetected = e.attributes.rights.toLowerCase().split('|').map(function (e) {
                return e.trim();
            });
            if (rightsDetected.some((e) => potentiallyDangerousRightsArray.indexOf(e) !== -1))
                return true;
    	});

        for (var issue of insecureDelegateEntry)
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A delegate policy was set to ${issue.attributes.rights}`,
            "description": `The policy is currently defining a <code>delegate</code> directive with risky permissions <code>${issue.attributes.rights}</code> for the pattern <code>${issue.attributes.pattern}</code>. If possible, you should deny access to all delegates except for the proven safe types.`
            });

        //// INSECURE DELEGATE PATTERNS NOT LIMITED FINDING

        let insecureDelegatesNotLimited = res.filter((e) => // we check if among all the defined rights none + coder patterns they forgot to deny all first & allow selected then
            (e.attributes.rights === "none") && (e.attributes.pattern === "*") // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        if (insecureDelegatesNotLimited.length === 0) // all patterns are not limited first
            results.push({
            "line": `<policy domain="delegate" rights="none" pattern="???" />`,
            "title": `Missing allow-list approach in the delegate policy`,
            "description": `The current delegate policy is not starting with denying the permissions for all delegates. To avoid a denylist approach, you should first exclude all the delegates setting <code>rights</code> to <code>none</code> for all patterns (using <code>*</code>) at the beginning of the policy, and then allow only a safe subset of delegates.`
            });

    	return results;
	} else { // no delegate is specified
	    return {
	        "line": `<policy domain="delegate" rights="???" pattern="???"/>`,
	        "title": "Missing allow-list approach in the delegate policy",
	        "description": `The policy is missing a <code>delegate</code> directive with permissions <code>none</code> for the pattern <code>*</code>. If possible, you should deny access to all delegates except for the proven safe types.`
        }
	}
}l
