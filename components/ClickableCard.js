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

export function ClickableCardCategory({ data = [], title = "" }){
    let content;

    if (data.length !== 0){
        content = data.map(item => (
            <a href = {`/admin/category/${encodeURIComponent(item)}`} key = {item} className={styles.custCard}> 
                <b style={{paddingRight:"18px"}}>{item}</b>
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

export function ClickableCardOrder({ data = [], title = "", invoice = false }) {
  let content;

  if (data.length !== 0) {
    content = data.map((item) => {
      let displayID = item.orderID;
      if (invoice) {
        const date = new Date(item.dateOfCreation);
        const yy = String(date.getFullYear()).slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        displayID = `${yy}${mm}${item.orderID}`;
      }

      return (
        <a
          href={`/admin/orders/${item.orderID}`}
          key={item.orderID}
          className={styles.ordCard}
        >
          <b>{displayID}</b>
          <div>{item.customerName}</div>
          <div>RM {item.totalPrice}</div>
          <div>{item.deliveryDate}</div>
          <div
            style={{
              color:
                item.deliveryStatus === "Delivered"
                  ? "green"
                  : item.deliveryStatus === "Pending"
                  ? "orange"
                  : item.deliveryStatus === "Cancelled"
                  ? "red"
                  : "black",
            }}
          >
            {item.deliveryStatus}
          </div>
        </a>
      );
    });
  } else {
    content = <p></p>;
  }
  let orderLegend = "Order ID";
  if (invoice) {
    orderLegend = "Invoice ID";
  }
  content = (
    <>
      <div className={styles.ordCardLegend}>
        <b style={{ paddingRight: "18px" }}>{orderLegend}</b>
        <div>Customer</div>
        <div>Total Price</div>
        <div>Delivery Date</div>
        <div>Delivery Status</div>
      </div>
      {content}
    </>
  );

  if (title !== "") {
    content = (
      <>
        <p>{title}</p>
        {content}
      </>
    );
  }

  return (
        <div className={styles.cardBase}>
            {content}
        </div>
    );
}
