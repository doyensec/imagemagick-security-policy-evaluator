if (xmlPolicy) {

	var results = [];

    var insecureMemoryLimitRegexGb = /(\d+) ?Gi?B/gi; // 1 GiB
    var insecureMemoryLimitRegexMb = /(\d+) ?Mi?B/gi; // 1 GiB = 1024 MiB
    var insecureMemoryLimitRegexKb = /(\d+) ?Ki?B/gi; // 1 GiB = 1049000 KiB

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   e.attributes.name == "disk" &&
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

            if ((kbAmount && kbAmount[1] && kbAmount[1] > 1049000) ||
                (mbAmount && mbAmount[1] && mbAmount[1] > 1024) ||
    		    (gbAmount && gbAmount[1] && gbAmount[1] > 1))
    				return true;
    	});

    	for (var issue of insecureMemorySet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Disk limit may be too high",
	        "description": `The policy is setting a disk space limit over <code>1 GiB</code>. This policy is used to determine the maximum amount of disk space in bytes that is permitted for use by the pixel cache. When this limit is exceeded, the pixel cache is not be created and an error message is returned.
             More specifically, ImageMagick accounts for possible huge storage requirements by caching large images to disk rather than memory. Typically the pixel cache is stored in memory using heap memory. If heap memory is exhausted, the pixel cache is created on disk and attempts to memory-map it. If memory-map memory is exhausted, ImageMagick will simply use standard disk I/O.
             ImageMagick will always attempt to allocate the maximum necessary resources, but your system may be temporarily sluggish or unavailable, or ImageMagick may abort. Note that depending on your usage or environment, these values could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="disk" value="???"/>`,
	        "title": "Disk limit is missing",
	        "description": `The policy is not setting any disk space limit. The default limit is <code>18.45EB</code>, but it is adjusted relative to the available resources on the machine if this information is available. This policy is used to determine the maximum amount of disk space in bytes that is permitted for use by the pixel cache. When this limit is exceeded, the pixel cache is not created and an error message is returned.
             More specifically, ImageMagick accounts for possible huge storage requirements by caching large images to disk rather than memory. Typically the pixel cache is stored in memory using heap memory. If heap memory is exhausted, ImageMagick creates the pixel cache on disk and attempts to memory-map it. If memory-map memory is exhausted, ImageMagick will simply use standard disk I/O.
             ImageMagick will always attempt to allocate the maximum necessary resources, but your system may be temporarily sluggish or unavailable, or ImageMagick may abort. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}
