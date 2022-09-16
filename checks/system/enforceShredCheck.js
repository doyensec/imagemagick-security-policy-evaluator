if (xmlPolicy) {

	var results = [];

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "system" &&
        	   e.attributes.name == "shred"
    })

    if (res.length > 0) {
    	let shredEnabledSet = res.filter((e) => {
            if (e.attributes.value && e.attributes.value > 0)
    				return true;
    	});

    	for (var issue of shredEnabledSet)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "A number of shredding iterations is set",
	        "description": `The policy is setting a shred value. This policy sets the number of times to replace content of certain memory buffers and temporary files before they are freed or deleted. For performance reasons, the first pass is fast by repeating the random sequence as necessary to overwrite the contents of the buffer or file. Subsequent passes are an order of magnitude slower, but generate cryptographically strong random bytes for the length of the buffer or file. It's important to note that this defense <a href="https://superuser.com/questions/22238/how-to-securely-delete-files-stored-on-a-ssd">may not work as intended in SSD drives</a> because of their design. Note that depending on your use or environment, this value could still be acceptable.`
	    	});
    	
    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="shred" value="???"/>`,
	        "title": "Specify a number of shredding iterations",
	        "description": `The policy is not setting a shred value. The option is disabled by default. This policy sets the number of times to replace content of certain memory buffers and temporary files before they are freed or deleted. For performance reasons, the first pass is fast by repeating the random sequence as necessary to overwrite the contents of the buffer or file. Subsequent passes are an order of magnitude slower, but generate cryptographically strong random bytes for the length of the buffer or file. It's important to note that this defense <a href="https://superuser.com/questions/22238/how-to-securely-delete-files-stored-on-a-ssd">may not work as intended in SSD drives</a> because of their design. Note that depending on your use or environment, not setting a value could still be acceptable.`
	    }
	}

}