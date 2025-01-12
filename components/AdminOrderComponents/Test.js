//used for testing post request.

// payload of information sent to orderDB from customer side.
// --------------------------------------
// customer name - outlet's name
// cart object (array of product objects - each product object has attribute name, quantity, price per piece)
// Delivery/pickup date
// acronym outlet name.
// total price of order (optional for the payload to receive)
// --------------------------------------



async function sendPostReq(){
    const payload = {
        custName: "fake",
        cart: [{
            productName: "test product name 1",
            productQty: 5,
            pricePerPiece: 5 
            }, {
            productName: "test product name 2",
            productQty: 2,
            pricePerPiece: 10 
            }],
        delivDate: "1/1/2003",
        outName:"TN1", 
    }

    console.log("Constructed payload")
    console.log("About to send fetch request")


    //this might need ot be in a try catch
    try{
        const response = await fetch("http://localhost:8888/.netlify/functions/orders", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "content-type": "application/json"
            }
        })
        console.log("Here's the response:", response)
        console.log("Status code:", response.status)
        const response_body = await response.json()
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

export function Test(){
    return(
        <div>
            <button onClick = {sendPostReq}> Click to test post request</button>
        </div>
        
        )
}


 

