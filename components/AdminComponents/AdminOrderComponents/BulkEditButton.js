import style from "./BulkEditButton.module.css"
import { useRouter } from "next/router";

export default function BulkEditButton({children}) {
  const router = useRouter()
  const sendGetReq = async () => {
    try {
      const response = await fetch("../../.netlify/functions/orders", {
        method: "GET",
      });
      const response_body = await response.json(); //gets rid of everything, turns the body property of the response into a JS object (not necessarily a plain object) and returns that.
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
          router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/orders/edit`)
        }}>
        {children}
      </button>
    </div>
  );
}
