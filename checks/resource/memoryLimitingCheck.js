if (xmlPolicy) {

	var results = [];

    var insecureMemoryLimitRegexGb = /(\d+) ?Gi?B/gi;
    var insecureMemoryLimitRegexMb = /(\d+) ?Mi?B/gi; // 256 MiB
    var insecureMemoryLimitRegexKb = /(\d+) ?Ki?B/gi; // 256 MiB = 262144 KiB

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   e.attributes.name == "memory" &&
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

            if ((kbAmount && kbAmount[1] && kbAmount[1] > 262144) ||
                (mbAmount && mbAmount[1] && mbAmount[1] > 256) ||
                (gbAmount))
    				return true;
    	});

    	for (var issue of insecureMemorySet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Memory limit may be too high",
	        "description": "The policy is setting a memory limit over 256 MiB. This option sets the maximum amount of memory in bytes to allocate for the pixel cache from the heap. When this limit is exceeded, the image pixels are cached to memory-mapped disk (see <code>MAGICK_MAP_LIMIT</code>). ImageMagick will always attempt to allocate the maximum necessary resources (memory, disk), but your system may be temporarily sluggish or unavailable or ImageMagick may abort. Note that depending on your use or environment, these values could still be acceptable."
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="memory" value="???"/>`,
	        "title": "Memory limit is missing",
	        "description": `The policy is not setting any memory limit. This option sets the maximum amount of memory in bytes to allocate for the pixel cache from the heap. When this limit is exceeded, the image pixels are cached to memory-mapped disk (see <code>MAGICK_MAP_LIMIT</code>). The default limit is <code>1.5GiB</code>, but it is adjusted relative to the available resources on the machine if this information is available, even increasing to unlimited. Because of this, ImageMagick will always attempt to allocate any necessary resources (memory, disk), but your system may be temporarily sluggish or unavailable or ImageMagick may abort. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}