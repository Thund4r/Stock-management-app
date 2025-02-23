import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import style from "./AddOrderForm.module.css";


export default function AddOrderForm() {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <form className={style.form}>
      <div>
        <label for="cust_name">Customer Name</label>
        <input type="string" name="cust_name" id="cust_name" required></input>
      </div>
      <div>{/* by the looks of it, the item section here will need to be its own react component */}</div>
      <div>
        <label for="outletName">Outlet Name</label>
        <input type="string" name="outletName" id="outletName"></input>
      </div>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
    </form>
  );
}



/*idea
1. create some form with section: 
      a. Required - Customer name, Items (need more info to fully implement), outletName, DeliveryDate 
      b. Optional - Remark, Adjustment
2. on submit button of a form -> validate data in each section, ensuring only what we expect is allowed and that all sections that are "required" are filled -> call some function, pass in all the data from the form as arguments -> construct the payload
3. validate contents of each section of payload to ensure no malformed data
4. call Fetch on API with method POST.
*/

// payload of information sent to orderDB from admin side
// --------------------------------------
// customer name - outlet's name
// cart object (array of product objects - each product object has attribute name, quantity, price per piece). This corresponds to the "add item" button
// Delivery/pickup date
// acronym outlet name.
// --------------------------------------

// async function sendPostReq() {
//   const payload = {
//     custName: "fake",
//     cart: [
//       {
//         productName: "test product name 1",
//         quantity: 5,
//         price: 5,
//       },
//       {
//         productName: "test product name 2",
//         quantity: 2,
//         price: 10,
//       },
//     ],
//     delivDate: "1/1/2003",
//     outName: "TN1",
//   };

//   console.log("Constructed payload");
//   console.log("About to send fetch request");

//   try {
//     //change back to orders after done testing using the test API
//     const response = await fetch("../../.netlify/functions/orders", {
//       method: "POST",
//       body: JSON.stringify(payload),
//       headers: {
//         "content-type": "application/json",
//       },
//     });
//     console.log("Here's the response:", response);
//     console.log("Status code:", response.status);
//     const response_body = await response.json();
//     console.log("Success:", response_body.success);
//     console.log("Message:", response_body.message);
//     console.log("Error:", response_body.error);
//     // if(response.ok){
//     //     console.log("The response.ok status:", response.ok)
//     //     const response_body = await response.json()
//     // }
//   } catch (error) {
//     console.log("An error was thrown,", error);
//   }
// }

// // repeatWithDelay(sendPostReq, 2000, 5, 0)
// export function Test({ children }) {
//   return (
//     <div>
//       <button
//         onClick={() => {
//           sendPostReq();
//         }}
//       >
//         {" "}
//         {children}{" "}
//       </button>
//     </div>
//   );
// }
