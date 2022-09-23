if (xmlPolicy) {

	var results = [];

    const insecureImageSizeRegex = /(\d+) ?(K|M|G|T|P)?P/gi;
    const multipliers = {
        "K": 1e3,
        "M": 1e6,
        "G": 1e9,
        "T": 1e12,
        "P": 1e15
    }

    let res = xmlPolicy.children.filter((e) => {
        insecureImageSizeRegex.lastIndex = 0;
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   (e.attributes.name == "width" || e.attributes.name == "height") &&
               insecureImageSizeRegex.test(e.attributes.value) // it should be at least in the correct format to be valid
    })

    if (res.length > 0) {
    	let insecureSizeSet = res.filter((e) => {
            insecureImageSizeRegex.lastIndex = 0;
            let sizeSet = insecureImageSizeRegex.exec(e.attributes.value);
            let normalizedUnit;
            if (sizeSet[2]) { // there's a unit associated
                normalizedUnit = sizeSet[1] * multipliers[sizeSet[2].toUpperCase()];
            } else { // just pixel
                normalizedUnit = sizeSet[1];
            }
            if (normalizedUnit > 8000)
                return true;
    	});

    	for (var issue of insecureSizeSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": `Size limit for ${issue.attributes.name} may be too high`,
	        "description": `The policy is setting a ${issue.attributes.name} limit over <code>8000</code> pixels. By default, ImageMagick will process images up to 8192 pixels. The height and width parameters can be used as the first safeguards against maliciously crafted images generating large images leading to Denial of Service or slowdowns.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="width" value="???"/>\n\n<policy domain="resource" name="height" value="???"/>`,
	        "title": "Size limit for width and height is missing",
	        "description": `The policy is not setting a width/height maximum pixel limit. By default, ImageMagick will process images up to <code>8192</code> pixels. The height and width parameters can be used as the first safeguards against maliciously crafted images generating large images leading to Denial of Service or slowdowns. Note that depending on your usage or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}
