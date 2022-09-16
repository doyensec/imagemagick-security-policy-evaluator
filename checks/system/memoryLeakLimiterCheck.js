if (xmlPolicy) {

	var results = [];

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   (e.attributes.domain == "system" || e.attributes.domain == "cache") &&
        	   e.attributes.name == "memory-map" &&
               e.attributes.value === "anonymous"
    })

    if (res.length > 0) {

        var systemSet, cacheSet = false;

    	for (var issue of res)
        {
            if (issue.attributes.domain === "system")
                systemSet = true;

            if (issue.attributes.domain === "cache")
                cacheSet = true;
    	}

        if (!systemSet)
                results.push({
                "line": `<policy domain="system" name="memory-map" value="???" />`,
                "title": "Enable anonymous memory mapping rather than from heap",
                "description": `The policy is not enabling the initialization of buffers with zeros, resulting in a minor performance penality but at a security cost. This policy can potentially prevent the exploitation of some memory corruption or leakage issues. Depending on your use or environment, this value could still be acceptable.`
                });

        if (!cacheSet)
                results.push({
                "line": `<policy domain="cache" name="memory-map" value="???" />`,
                "title": "Enable anonymous memory mapping rather than from heap",
                "description": `The policy is not enabling the initialization of caches with zeros, resulting in a minor performance penality but at a security cost. This policy can potentially prevent the exploitation of some memory corruption or leakage issues. Depending on your use or environment, this value could still be acceptable.`
                });

    	return results;
	} else {
	    return {
	        "line": `<policy domain="system" name="memory-map" value="???"/>\n\n<policy domain="cache" name="memory-map" value="???"/>`,
	        "title": "Enable anonymous memory mapping",
	        "description": `The policy is not enabling the initialization of buffers or caches with zeros, resulting in a minor performance penality but at a security cost. This policy can potentially prevent the exploitation of some memory corruption or leakage issues. Depending on your use or environment, this value could still be acceptable.`
	    }
	}

}