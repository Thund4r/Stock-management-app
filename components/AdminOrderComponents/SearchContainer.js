import AdminSearchBar from "./SearchBar.js";
import AdminSearchBarList from "./SearchBarList.js";
import { useState, useEffect } from "react";



export default function SearchContainer({ initialOrders }) {
  const [item, setItem] = useState(initialOrders);
    

  return (
    <div>
      <AdminSearchBar setItem={setItem} />
      <AdminSearchBarList item={item}/>
    </div>
  );
}
