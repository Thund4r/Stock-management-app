import { useDebouncedCallback } from "use-debounce";

const normaliseToString = (propValue) =>{
  return String(propValue).toLowerCase()
}

const HandleSearch = (event, setItem) => {
  const userInput = event.target.value.toLowerCase();
  const orders = JSON.parse(sessionStorage.getItem("orders"));
  
  const filteredOrders = orders.filter((order) => {
    return Object.values(order).some((propValue) => {
      return normaliseToString(propValue).includes(userInput);
    }); 
  });
  setItem(filteredOrders)
};

export default function SearchBar({ setItem }) {
  const debounceHandleSearch = useDebouncedCallback(HandleSearch, 1000);

  return (
    <input
      placeholder="search"
      onChange={async (event) => {
        debounceHandleSearch(event, setItem);
      }}
    />
  );
}
