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
        	   e.attributes.name == "time"
    })

    if (res.length > 0) {
    	let insecureListLengthSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 120)
    				return true;
    	});

    	for (var issue of insecureListLengthSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Timeout limit may be too high",
	        "description": `The policy is setting a proper timeout below <code>120</code>. This policy sets the maximum time allowed in seconds to process the image. When this limit is exceeded, an exception is thrown and processing stops. Note that depending on your usage or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="time" value="???"/>`,
	        "title": "Specify a timeout for the processing",
	        "description": `The policy is not setting a thread limit number. The default limit is <code>2</code>. This policy sets the maximum time allowed in seconds to process the image. When this limit is exceeded, an exception is thrown and processing stops. Note that depending on your usage or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}
