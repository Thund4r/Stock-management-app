import styles from '../../styles/adminorders.module.css'
import {CreateOrderButton} from "../../components/AdminOrderComponents/CreateOrderButton.js"
import {BulkEditButton} from "../../components/AdminOrderComponents/BulkEditButton.js"

export default function page(){
    return(
        <div>
            <div className = {styles.actionToolbar}>
                <span>
                <h5>Orders</h5>
                {/* add question mark to end up next to header */}
                </span>
                <span className = {styles.actionButtonContainer}>
                    <BulkEditButton></BulkEditButton>
                    <CreateOrderButton></CreateOrderButton>
                </span>
            </div>
        </div>
    )
}
