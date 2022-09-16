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
               e.attributes.domain == "coder"
    })

    if (res.length > 0) { // there's at least a "coder" with rights & pattern

        //// LOWERCASE PATTERNS EXIST FINDING

        let undercasePatterns = res.filter((e) => // we check if the patterns are all upper case, since they are case sensitive, see https://github.com/ImageMagick/ImageMagick/issues/4235
            (e.attributes.pattern !== e.attributes.pattern.toUpperCase()) && !(e.attributes.pattern.includes("[") && e.attributes.pattern.includes("]")) // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        for (var issue of undercasePatterns) // lowercase pattern findings
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A ${issue.attributes.domain} policy is using lowercase characters in its pattern expression`,
            "description": `The policy is currently defining a <code>${issue.attributes.domain}</code> directive with some lowercase characters in its pattern definition: <code>${issue.attributes.pattern}</code>. Internally, ImageMagick refers to all modules & coders in <a href="https://github.com/ImageMagick/ImageMagick/issues/4235" target="_blank">uppercase</a>. Because of this, this pattern will probably won't work as intended. If possible, ensure that the casing of the pattern is correct.`
            });

        //// INSECURE PERMISSIONS EXIST FINDING

        let insecureCoderEntry = res.filter((e) => {
            let rightsDetected = e.attributes.rights.toLowerCase().split('|').map(function (e) {
                return e.trim();
            });
            if (rightsDetected.some((e) => potentiallyDangerousRightsArray.indexOf(e) !== -1))
                return true;
        });

        for (var issue of insecureCoderEntry)
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A coder policy was set to ${issue.attributes.rights}`,
            "description": `The policy is currently defining a <code>coder</code> directive with risky permissions <code>${issue.attributes.rights}</code> for the pattern <code>${issue.attributes.pattern}</code>. In order to reduce the available attack surface, you should consider tightenting the required <code>rights</code> and deny access to all coders except for the proven, needed safe ones.`
            });

        //// INSECURE CODER PATTERNS NOT LIMITED FINDING

        let insecureCodersNotLimited = res.filter((e) => // we check if among all the defined rights none + coder patterns they forgot to deny all first & allow selected then
            (e.attributes.rights === "none") && (e.attributes.pattern === "*") // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        if (insecureCodersNotLimited.length === 0) // all patterns are not limited first
            results.push({
            "line": `<policy domain="coder" rights="none" pattern="???" />`,
            "title": `Missing allow-list approach in the coder policy`,
            "description": `The current coders policy is not denying first the permissions for all coders. To avoid a denylist approach, you should at first exclude all the coders setting <code>rights</code> to <code>none</code> for all patterns (using <code>*</code>) at the beginning of the policy, and then allow only a safe subset of coders.`
            });

    	return results;
	} else { // no coder is specified
	    return {
	        "line": `<policy domain="coder" rights="???" pattern="???"/>`,
	        "title": "Specify a coder policy to deny access to coders",
	        "description": `The policy is missing a <code>coder</code> directive with permissions <code>none</code> for the pattern <code>*</code>. In order to reduce the available attack surface, you should deny access to all coders except for the proven, needed safe types.`
        }
	}
}l