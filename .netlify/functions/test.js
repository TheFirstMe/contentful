"use strict"
const contentful = require("contentful-management")
exports.handler = function (event, context, callback) {
    async function main() {
        // Post ID from get request
        console.log("Hello")
        const spaceId = process.env.CONTENTFUL_SPACE_ID
        const acces = process.env.CONTENTFUL_MANANGEMENT_ACCESS_TOKEN
        const ID = await event.queryStringParameters.ID
        console.log(ID)
        // Start with empty array
        let postComments = []
        // Connect to contentful
        const client = contentful.createClient({
            accessToken: acces
        })
        // Get the entry based on post ID.
        await client
            .getSpace(spaceId)
            .then(space => space.getEnvironment("master"))
            .then(environment => environment.getEntry(ID))
            .then(entry => {
                // If no comments exist
                console.log("Inside client")
                if (entry.fields.comments === undefined) {
                    // Create the JSON needed to store comments
                    entry.fields.comments = {
                        "en-US": {
                            comments: []
                        }
                    }
                    // Update entry
                    return entry.update()
                } else {
                    // Grab the comments
                    console.log("Grabbing comments")
                    entry.fields.comments["en-US"].comments.forEach(comment => {
                        postComments.push(comment)
                    })
                }
            }).then(() => {
                // Callback with comments to update state
                console.log(postComments)
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        comments: postComments
                    })
                })
            })
    }
    main().catch(console.error)
}