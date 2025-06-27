import styles from './ClickableCard.module.css'


export function ClickableCardProduct({ data = [], title = "" , destinationURL}) {

    let content;

    if (data.length !== 0){
        content = data.map(item => (
            <a href={`${destinationURL}/${encodeURIComponent(item.Name)}`} key={item.Name} className={styles.prodCard}>
                <b>{item.Name}</b> <br/>
                <small>{item.Description}</small> <br/>
                RM {item.Price} 
                
            </a>
        ));
    }
    else{
        content = (
        <p>
            
        </p>);
    }
    if (title !== ""){
        content = (
            <>
                <p>
                    {title}
                </p>
                {content}
            </>
        );
    }
    

    return(
        <div className = {styles.cardBase}>
            {content}
        </div>
    );
}

export function ClickableCardCustomer({ data = [], title = "" }){
    let content;

    if (data.length !== 0){
        content = data.map(item => (
            <a href = {`/admin/customers/${encodeURIComponent(item.Name)}`} key = {item.Name} className={styles.custCard}> 
                <b style={{paddingRight:"18px"}}>{item.Name}</b>
                <div>{item.Phone}</div>
            </a>
        ));
    }
    else{
        content = (
        <p>
            
        </p>);
    }
    if (title !== ""){
        content = (
            <>
                <p>
                    {title}
                </p>
                {content}
            </>
        );
    }
    

    return(
        <div style={{flex: 1}}>
            {content}
        </div>
    );
}

export function ClickableCardOrder({ data = [], title = "" }){
    let content;

    if (data.length !== 0){
        content = data.map(item => (
            <a href={`/admin/orders/${item.orderID}`} key = {item.orderID} className={styles.ordCard}> 
                <b style={{paddingRight:"18px"}}>{item.orderID}</b>
                <div>{item.customerName}</div>
                <div>RM {item.totalPrice}</div>
                <div>{item.deliveryDate}</div>
                <div style={{
                color: item.deliveryStatus === "Delivered" ? "green" :
                        item.deliveryStatus === "Pending" ? "orange" :
                        item.deliveryStatus === "Cancelled" ? "red" : "black"
                }}>
                {item.deliveryStatus}
                </div>
            </a>
        ));
    }
    else{
        content = (
        <p>
            
        </p>);
    }
    content = (
        <> 
            <div className={styles.ordCard}>
                <b style={{paddingRight:"18px"}}>Order ID</b>
                <div>Customer</div>
                <div>Total Price</div>
                <div>Delivery Date</div>
                <div>Delivery Status</div>
            </div>
            {content}
        </>
    );
    if (title !== ""){
        content = (
            <>
                <p>
                    {title}
                </p>
                {content}
            </>
        );
    }
    

    return(
        <div className = {styles.cardBase}>
            {content}
        </div>
    );
}