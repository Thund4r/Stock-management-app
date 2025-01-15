import styles from '../../styles/adminorders.module.css'
import {CreateOrderButton, Test} from "../../components/AdminOrderComponents/CreateOrderButton.js"
import {BulkEditButton} from "../../components/AdminOrderComponents/BulkEditButton.js"

export default function page(){
    return(
        <main className = {styles.ordersContainer}>
            <div className = {styles.actionToolbar}>
                <h3>Orders</h3>
                {/* add question mark to end up next to header */}
                <span className = {styles.actionButtonContainer}>
                    <BulkEditButton></BulkEditButton>
                    <Test></Test>
                </span>
            </div>
            <div>
                hello
            </div>
        </main>
    )
}
