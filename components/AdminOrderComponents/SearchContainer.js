import AdminSearchBar from "./SearchBar.js";
import AdminSearchBarList from "./SearchBarList.js";
import { useState, useEffect } from "react";



export default function SearchContainer({ initialOrders }) {
  const [item, setItem] = useState(initialOrders);

  
  useEffect(() => {
    sessionStorage.setItem("orders", JSON.stringify(initialOrders))
    }, []) //empty dependency array so it only runs after initial render and that's it.
    

  return (
    <div>
      <AdminSearchBar setItem={setItem} />
      <AdminSearchBarList item={item}/>
    </div>
  );
}
