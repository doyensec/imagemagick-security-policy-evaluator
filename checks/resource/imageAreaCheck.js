if (xmlPolicy) {

	var results = [];

    const insecureImageAreaRegex = /(\d+) ?(K|M|G|T|P)?P/gi;
    const multipliers = {
        "K": 1e3,
        "M": 1e6,
        "G": 1e9,
        "T": 1e12,
        "P": 1e15
    }

    let res = xmlPolicy.children.filter((e) => {
        insecureImageAreaRegex.lastIndex = 0;
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   (e.attributes.name == "area") &&
               insecureImageAreaRegex.test(e.attributes.value) // it should be at least in the correct format to be valid
    })

    if (res.length > 0) {
    	let insecureSizeSet = res.filter((e) => {
            insecureImageAreaRegex.lastIndex = 0;
            let sizeSet = insecureImageAreaRegex.exec(e.attributes.value);
            let normalizedUnit;
            if (sizeSet[2]) { // there's a unit associated
                normalizedUnit = sizeSet[1] * multipliers[sizeSet[2].toUpperCase()];
            } else { // just pixel
                normalizedUnit = sizeSet[1];
            }
            if (normalizedUnit > 16000)
                return true;
    	});

    	for (var issue of insecureSizeSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": `Area limit may be too high`,
	        "description": `The policy is setting an area limit over <code>16KP</code> pixels. By default, ImageMagick will process images area up to <code>3GB</code>. The height and width parameters can be used as the first safeguards against maliciously crafted images generating large images leading to Denial of Service or slowdowns.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="area" value="???"/>`,
	        "title": "Area limit is missing",
	        "description": `The policy is not setting a maximum area limit. By default, ImageMagick will process images area up to <code>3GB</code>. If the resource request exceeds the area limit, the pixels are automagically cached to disk. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}