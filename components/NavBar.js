import { NavLink } from "@mantine/core";
import style from "./NavBar.module.css"

export default function NavBar() {
    return(<div className = {style.navBar}>
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