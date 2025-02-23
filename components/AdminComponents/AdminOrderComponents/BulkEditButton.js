import style from "./BulkEditButton.module.css"

export default function BulkEditButton() {
  const sendGetReq = async () => {
    try {
      const response = await fetch("../../.netlify/functions/orders", {
        method: "GET",
      });
      console.log("Here's the response:", response);
      console.log("Status code:", response.status);
      const response_body = await response.json(); //gets rid of everything, turns the body property of the response into a JS object (not necessarily a plain object) and returns that.
      console.log(response_body);
      console.log("Success:", response_body.success);
      console.log("Message:", response_body.message);
      console.log("Error:", response_body.error);
      return response_body.items
    } catch (error) {
      console.log("An error was thrown,", error);
    }
  };

  return (
    <div>
      <button 
      className = {style.test}
        onClick={async () => {
          const items = await sendGetReq();
          sessionStorage.setItem("orders", JSON.stringify(items));
        }}
      >
        Click to test get request
      </button>
    </div>
  );
}
