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
               e.attributes.domain == "module"
    })

    if (res.length > 0) { // there's at least a "module" with rights & pattern

        //// LOWERCASE PATTERNS EXIST FINDING

        let lowercasePatterns = res.filter((e) => // we check if the patterns are all upper case, since they are case sensitive, see https://github.com/ImageMagick/ImageMagick/issues/4235
            (e.attributes.pattern !== e.attributes.pattern.toUpperCase()) && !(e.attributes.pattern.includes("[") && e.attributes.pattern.includes("]")) // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        for (var issue of lowercasePatterns)
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A ${issue.attributes.domain} policy is using lowercase characters in its pattern expression`,
            "description": `The policy is currently defining a <code>${issue.attributes.domain}</code> directive with some lowercase characters in its pattern definition: <code>${issue.attributes.pattern}</code>. Internally, ImageMagick refers to all modules & coders in <a href="https://github.com/ImageMagick/ImageMagick/issues/4235" target="_blank">uppercase</a>. Because of this, this pattern likely won't work as intended. If possible, ensure that the case of the pattern is correct.`
            });


        //// INSECURE PERMISSIONS EXIST FINDING

        let insecureModuleEntry = res.filter((e) => { // we check the rights
            let rightsDetected = e.attributes.rights.toLowerCase().split('|').map(function (e) {
                return e.trim();
            });
            if (rightsDetected.some((e) => potentiallyDangerousRightsArray.indexOf(e) !== -1)) // either read, write, or execute were detected
                return true;
        });

        for (var issue of insecureModuleEntry)
            results.push({
            "line": `<${issue.name} domain="${issue.attributes.domain}" rights="${issue.attributes.rights}" pattern="${issue.attributes.pattern}" />`,
            "title": `A module policy was set to ${issue.attributes.rights}`,
            "description": `The policy is currently defining a <code>module</code> directive with risky permissions <code>${issue.attributes.rights}</code> for the pattern <code>${issue.attributes.pattern}</code>. The pattern is used to manage the allowed coder modules. Modules also permit the user to extend ImageMagick's image processing functionality by adding loadable modules to a preferred location rather than copying them into the ImageMagick installation directory. Such a feature could be abused for RCE by an attacker. If possible, you should deny access to all modules except for the proven safe types.`
            });


        //// INSECURE MODULE PATTERNS NOT LIMITED FINDING

        let insecureModuleNotLimited = res.filter((e) => // we check if among all the defined rights none + coder patterns they forgot to deny all first & allow selected then
            (e.attributes.rights === "none") && (e.attributes.pattern === "*") // if case-insensitive pattern such as [Pp][Nn][Gg] are used, it's probably a false positive
        )

        if (insecureModuleNotLimited.length === 0) // all patterns are not limited first
            results.push({
            "line": `<policy domain="module" rights="none" pattern="???" />`,
            "title": `Missing allow-list approach in the module policy`,
            "description": `The current policy is not starting with denying the permissions for all modules. To avoid a denylist approach, you should at first exclude all the modules setting <code>rights</code> to <code>none</code> for all patterns (using <code>*</code>) at the beginning of the policy, and then allow only a safe subset of modules.`
            });

    	return results;
	} else {
	    return {
	        "line": `<policy domain="module" rights="???" pattern="???"/>`,
	        "title": "Specify a module policy to deny access to modules",
	        "description": `The policy is missing a <code>module</code> directive with permissions <code>none</code> for the pattern <code>*</code>. The pattern is used to manage the allowed coder modules. Modules also permit the user to extend ImageMagick's image processing functionality by adding loadable modules to a preferred location rather than copying them into the ImageMagick installation directory. Such a feature could be abused for RCE by an attacker. If possible, you should deny access to all modules except for the proven safe types.`
        }
	}
}l
