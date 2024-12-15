import styles from './ClickableCard.module.css'

export default function ClickableCard({data = [], title = ""}) {

    let content;

    if (data.length !== 0){
        content = data.map(item => (
            //Change p to a when changing this to clickable and href to unique product page
            <p key = {item.Name}> 
                <b>{item.Name}</b> <br/>
                <small>{item.Quantifier}</small> <br/>
                RM {item.Price} 
                
            </p>
        ));
    }
    else{
        content = (
        <p>
            Products are empty.
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
        <div className = {styles.card}>
            {content}
        </div>
    );
}