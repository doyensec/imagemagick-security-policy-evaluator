if (xmlPolicy) {

	var results = [];

    var insecureMemoryLimitRegexGb = /(\d+) ?Gi?B/gi;
    var insecureMemoryLimitRegexMb = /(\d+) ?Mi?B/gi; // 512 MiB
    var insecureMemoryLimitRegexKb = /(\d+) ?Ki?B/gi; // 512 MiB = 524288 KiB

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   e.attributes.name == "map" &&
               (insecureMemoryLimitRegexKb.test(e.attributes.value) || insecureMemoryLimitRegexMb.test(e.attributes.value) || insecureMemoryLimitRegexGb.test(e.attributes.value)) // it should be at least in the correct format to be valid
    })

    insecureMemoryLimitRegexGb.lastIndex = 0;
    insecureMemoryLimitRegexMb.lastIndex = 0;
    insecureMemoryLimitRegexKb.lastIndex = 0;

    if (res.length > 0) {
    	let insecureMemorySet = res.filter((e) => {
            let kbAmount = insecureMemoryLimitRegexKb.exec(e.attributes.value);
            let mbAmount = insecureMemoryLimitRegexMb.exec(e.attributes.value);
            let gbAmount = insecureMemoryLimitRegexGb.exec(e.attributes.value);

            if ((kbAmount && kbAmount[1] && kbAmount[1] > 524288) ||
                (mbAmount && mbAmount[1] && mbAmount[1] > 512) ||
    		    (gbAmount))
    				return true;
    	});

    	for (var issue of insecureMemorySet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Memory limit may be too high",
	        "description": "The policy is setting a map limit over <code>512 MiB</code>. This setting specifies the maxium amount of memory map in bytes that ImageMagick can use to allocate for the pixel cache. When this limit is exceeded, the image pixels are cached to disk (see <code>MAGICK_DISK_LIMIT</code>). Depending on your use or environment, these values could still be acceptable."
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="map" value="???"/>`,
	        "title": "Map limit is missing",
	        "description": `The policy is not setting any map limit. This setting specifies the maxium amount of memory map in bytes that ImageMagick can use to allocate for the pixel cache. When this limit is exceeded, the image pixels are cached to disk (see <code>MAGICK_DISK_LIMIT</code>). Depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}