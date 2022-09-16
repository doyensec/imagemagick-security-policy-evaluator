if (xmlPolicy) {

	var results = [];

    var insecureMemoryLimitRegexGb = /(\d+) ?Gi?B/gi; // 1 GiB
    var insecureMemoryLimitRegexMb = /(\d+) ?Mi?B/gi; // 256 MiB
    var insecureMemoryLimitRegexKb = /(\d+) ?Ki?B/gi; // 256 MiB = 262144 KiB

    //  <policy domain="system" name="max-memory-request" value="256MiB"/>

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "system" &&
        	   e.attributes.name == "max-memory-request" &&
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
	        "title": "Maximum allocable request limit may be too high",
	        "description": `The policy is setting a memory request limit in bytes over <code>256 MiB</code>. This policy is used to determine the maximum amount of memory space in byte that is permitted for allocation requests. Some image processing algorithms (e.g. wavelet transform) might consume a substantial amount of memory to complete. ImageMagick maintains a separate memory pool for these large resource requests and as of 7.0.6-1 permits you to set a maximum request limit. If the limit is exceeded, an exception is thrown and the processing stops. This limit can be set by the maximum memory request by policy. Note that depending on your use or environment, these values could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="system" name="max-memory-request" value="???" />`,
	        "title": "Maximum allocable request limit is missing",
            "description": `The policy is not setting any memory request limit in bytes. The default limit is <code>256 MiB</code>. This policy is used to determine the maximum amount of memory space in byte that is permitted for allocation requests. Some image processing algorithms (e.g. wavelet transform) might consume a substantial amount of memory to complete. ImageMagick maintains a separate memory pool for these large resource requests and as of 7.0.6-1 permits you to set a maximum request limit. If the limit is exceeded, an exception is thrown and the processing stops. This limit can be set by the maximum memory request by policy. Note that depending on your use or environment, not setting a value could still be acceptable, even if discouraged.`
	    }
	}

}