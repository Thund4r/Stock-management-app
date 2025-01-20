export function BulkEditButton(){

    const  sendGetReq = async () =>{
        try{
            const response = await fetch("http://localhost:8888/.netlify/functions/orders", {
                method: "GET",
            })
            console.log("Here's the response:", response)
            console.log("Status code:", response.status)
            const response_body = await response.json() //gets rid of everything, turns the body property of the response into a JS object (not necessarily a plain object) and returns that.
            console.log(response_body)
            console.log("Success:", response_body.success)
            console.log("Message:", response_body.message)
            console.log("Error:", response_body.error)
            // if(response.ok){
            //     console.log("The response.ok status:", response.ok)
            //     const response_body = await response.json()
            // }
        }catch(error){
            console.log("An error was thrown,", error)
        }
    }


    return (
        <div>
            <button onClick = {sendGetReq}>Click to test get request</button>
        </div>        
    )
}