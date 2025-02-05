import { factoryHttpRes } from "utility/Utils"

export const handler = async (event) => {
    try{
        console.log("--------------------------------------------------")
        //expect event.body to contain an array of URLs to revalidate
        const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/api/revalidations`, {
            method: "POST",
            headers:{
                'Content-Type': "application/json"
            },
            body: event.body
        })
        const responseBody = await response.json()
        return factoryHttpRes (response.status, responseBody.success, responseBody.message, responseBody.error)
    }catch(err){
        console.log("Error in revalidation serverless function:", err)
        return factoryHttpRes (400, "False", "Error occured in netlify revalidation API", "Internal server error")
    }
    
    
}





