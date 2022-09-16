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
        	   e.attributes.name == "throttle"
    })

    if (res.length > 0) {
    	let insecureListLengthSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 50)
    				return true;
    	});

    	for (var issue of insecureListLengthSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "CPU throttle limit may be too high",
	        "description": `The policy is setting a proper throttle above <code>50</code> ms. This directive will let ImageMagick periodically yield the CPU for at least the time specified in milliseconds. Note that depending on your use or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="throttle" value="???"/>`,
	        "title": "Set a CPU throttle limit",
	        "description": `The policy is not setting a throttle limit number. This directive will let ImageMagick periodically yield the CPU for at least the time specified in milliseconds. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}