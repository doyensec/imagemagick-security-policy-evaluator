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
        	   e.attributes.name == "thread"
    })

    if (res.length > 0) {
    	let insecureListLengthSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 2)
    				return true;
    	});

    	for (var issue of insecureListLengthSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Thread number limit may be too high",
	        "description": `The policy is setting a thread limit over <code>2</code>. This policy sets the maximum number of parallel threads. Many ImageMagick algorithms run in parallel on multi-processor systems. Use this environment variable to set the maximum number of threads that are permitted to run in parallel. Note that depending on your usage or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="thread" value="???"/>`,
	        "title": "Specify a maximum number of threads",
	        "description": `The policy is not setting a thread limit number. The default limit is <code>2</code>. This policy sets the maximum number of parallel threads. Many ImageMagick algorithms run in parallel on multi-processor systems. Use this environment variable to set the maximum number of threads that are permitted to run in parallel. Note that depending on your usage or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}
