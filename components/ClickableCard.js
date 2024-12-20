import styles from './ClickableCard.module.css'

export default function ClickableCard({data = [], title = ""}) {

    let content;

    if (data.length !== 0){
        content = data.map(item => (
            //Change p to a when changing this to clickable and href to unique product page
            <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} key = {item.Name} className={styles.card}> 
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