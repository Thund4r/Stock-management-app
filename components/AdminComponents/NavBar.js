import { NavLink } from "@mantine/core";
export default function NarBar() {
    return(<div style={{ width: "21%", position: "sticky", top: 0,}}>
    <NavLink label="Dashboard" href=""/>
    <NavLink label="Orders">
        <NavLink label="All" href=""/>
        <NavLink label="Summary (Monthly spending here maybe)" href=""/>
    </NavLink>
    <NavLink label="Products">
        <NavLink label="All" href=""/>
        <NavLink label="Category" href=""/>
    </NavLink>
    <NavLink label="Customers" href={`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers`}/>
    <NavLink label="Settings" href=""/>
    </div>)
}