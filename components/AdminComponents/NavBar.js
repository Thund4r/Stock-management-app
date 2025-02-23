import { NavLink } from "@mantine/core";

export default function NavBar() {
    return(<div>
    <NavLink label="Dashboard" href=""/>
    <NavLink label="Orders">
        <NavLink label="All" href=""/>
        <NavLink label="Summary" href=""/>
    </NavLink>
    <NavLink label="Products">
        <NavLink label="All" href=""/>
        <NavLink label="Category" href=""/>
    </NavLink>
    <NavLink label="Customers" href=""/>
    <NavLink label="Settings" href=""/>
    </div>)
}