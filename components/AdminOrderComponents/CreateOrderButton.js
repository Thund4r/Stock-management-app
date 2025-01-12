// payload of information sent to orderDB from admin side
// --------------------------------------
// customer name - outlet's name
// cart object (array of product objects - each product object has attribute name, quantity, price per piece). This corresponds to the "add item" button
// Delivery/pickup date
// acronym outlet name.
// --------------------------------------



/* for post request
1. upon clicking order button, we call a function that constructs a payload and calls a fetch req to the API.
2. The fetch request should contain the API to send the req to and an object containing options to configure the request in the 2nd parameter.
3. object body should contain a header - content type, body - for the payload (paylaod will be written in JS but stringified to convert to JSON) and the method - post.
*/



export default function CreateOrderButton(){
    return (
        <div>
        <form>
            <input type = "string" name = "cust_name" required></input>
        </form>
        </div>
    )
}