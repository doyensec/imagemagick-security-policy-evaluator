if (xmlPolicy) {

	var results = [];

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   e.attributes.name == "file"
    })

    if (res.length > 0) {
    	let insecureListLengthSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 768)
    				return true;
    	});

    	for (var issue of insecureListLengthSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Opened pixel cache file number limit may be too high",
	        "description": `The policy is setting a file number limit over <code>768</code>. This policy is used to determine the maximum number of opened pixel cache files. When this limit is exceeded, any subsequent pixels cached to disk are closed and reopened on demand. This behavior permits a large number of images to be accessed simultaneously on disk, but with a speed penalty due to repeated open/close calls. ImageMagick will always attempt to allocate the maximum necessary resources, but your system may be temporarily sluggish or unavailable, or ImageMagick may abort. Note that depending on your usage or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="file" value="???"/>`,
	        "title": "Opened pixel cache file number limit is missing",
	        "description": `The policy is not setting any file number limit. The default limit is <code>768</code>. This policy is used to determine the maximum number of opened pixel cache files. When this limit is exceeded, any subsequent pixels cached to disk are closed and reopened on demand. This behavior permits a large number of images to be accessed simultaneously on disk, but with a speed penalty due to repeated open/close calls. Note that depending on your usage or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}
