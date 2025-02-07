import styles from './ClickableCard.module.css'


export function ClickableCardProduct({ data = [], title = "" }) {

    let content;

    if (data.length !== 0){
        content = data.map(item => (
            <a href = {`/products/${item.Name}`} key = {item.Name} className={styles.prodCard}> 
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
            <a href = {`/admin/customers/${item.Name}`} key = {item.Name} className={styles.custCard}> 
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
        <div className = {styles.cardBase}>
            {content}
        </div>
    );
}