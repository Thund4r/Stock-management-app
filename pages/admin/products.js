import AdminSearchContainer from "../../components/AdminSearchComponents/SearchContainer.js";

export default function page() {
  return (
    <div>
      <AdminSearchContainer API_URL={"https://jsonplaceholder.typicode.com/users"} />
    </div>
  );
}
