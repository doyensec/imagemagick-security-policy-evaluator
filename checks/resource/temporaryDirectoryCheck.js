if (xmlPolicy) {

	var results = [];

	const unsafePaths = ["/tmp","/var/tmp","C:\\\\Windows\\\\Temp","C:\\Windows\\Temp"]

    let res = xmlPolicy.children.filter((e) => {
        return e.type == "element" && 
        	   e.name == "policy" &&
        	   e.attributes &&
        	   e.attributes.domain &&
        	   e.attributes.name &&
        	   e.attributes.value &&
        	   e.attributes.domain == "resource" &&
        	   e.attributes.name == "temporary-path"
    })

    if (res.length > 0) {
    	let insecureTemporaryFolder = res.filter((e) => {
    		for (var unsafePath of unsafePaths)
    			if (e.attributes.value.startsWith(unsafePath))
    				return true;
    	});
    	for (var issue of insecureTemporaryFolder)
    		results.push({
	        "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
	        "title": "Saving to an insecure temporary folder",
	        "description": "The policy is currently defining a shared directory using the <code>temporary-path</code> attribute. Do not create temporary files in the default shared directories, instead specify a private area to store only ImageMagick temporary files by setting the <code>temporary-path</code> security policy or the <code>-define registry:temporary-path=/data/magick</code> command-line option."
	    	});

        if (insecureTemporaryFolder.length === 0)
            for (var issue of res)
                results.push({
                "line": `<${issue.name} domain="${issue.attributes.domain}" name="${issue.attributes.name}" value="${issue.attributes.value}" />`,
                "title": "Check the permissions of the temporary folder",
                "description": "The policy is currently defining a shared directory using the <code>temporary-path</code> attribute. Make sure that the directory permissions are locked down and not shared, only accessible to the low-privileged user running ImageMagick."
                });

    	return results;
	} else {
	    return {
	        "line": `<policy domain="resource" name="temporary-path" value="???"/>`,
	        "title": "Specify a secure temporary folder",
	        "description": `By default, ImageMagick checks for the existence of various environmental variables pointing to the system's default temporary folder and names its temporary files with a custom function defined in <a href="https://github.com/ImageMagick/ImageMagick/blob/main/MagickCore/resource.c#L603" target="_blank">MagickCore/resource.c</a>. As a best practice, do not create temporary files in the default shared directories, instead specify a private area to store only ImageMagick temporary files by setting the <code>temporary-path</code> security policy or the <code>-define registry:temporary-path=/data/magick</code> command-line option.`
	    }
	}
}