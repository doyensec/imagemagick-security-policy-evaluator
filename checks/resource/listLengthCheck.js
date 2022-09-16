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
        	   e.attributes.name == "list-length"
    })

    if (res.length > 0) {
    	let insecureListLengthSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 32)
    				return true;
    	});

    	for (var issue of insecureListLengthSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "List length limit may be too high",
	        "description": `The policy is setting a list length limit over <code>32</code>. This policy is used to determine the maximum number of images in a sequence space that can be processed for the final image. ImageMagick will always attempt to allocate the maximum necessary resources, but your system may be temporarily sluggish or unavailable or ImageMagick may abort. Note that depending on your use or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="list-length" value="???"/>`,
	        "title": "List length limit is missing",
	        "description": `The policy is not setting any list length limit. The default limit is <code>32</code>, but it is adjusted relative to the available resources on the machine if this information is available. This policy is used to determine the maximum number of images in a sequence space that can be processed for the final image. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}