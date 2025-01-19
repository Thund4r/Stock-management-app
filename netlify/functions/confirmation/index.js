require("dotenv").config();

export const handler = async (event) => {
    const recipientNumber = 60102222965
    const payload = JSON.parse(event.body);
    
    // try{
    //     const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_BUSINESS_ACCOUNT_ID}/message_templates?fields=name,status,components`, {
    //         headers: {
    //                     'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
    //                 }
    //     })
    //     console.log(await response.json())
    // }   
    // catch(e){
    //     console.log(e)
    // }

    // try{
    //     const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
    //         method: 'post',
    //         headers: {
    //             'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             messaging_product: 'whatsapp',
    //             to: `${recipientNumber}`,
    //             type: 'template',
    //             template:{
    //                 name: 'order_confirmation',
    //                 language: {
    //                     code: 'en'
    //                 },
    //                 components: [
    //                     {
    //                         type: 'header',
    //                         parameters: [
    //                             {
    //                                 type: 'text',
    //                                 parameter_name: 'company_name',
    //                                 text: 'Company Name Here'
    //                             }
    //                         ]
    //                     },
    //                     {
    //                         type: 'body',
    //                         parameters: [
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_id',
    //                                 text: '#12'
    //                             },
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_items',
    //                                 text: 'Chilled cake - Chocolate fudge (1), Cheese - Compte (3)'
    //                             },
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_delivery',
    //                                 text: '15/1/2025'
    //                             },
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_total',
    //                                 text: 'RM 27.20'
    //                             },
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_customer',
    //                                 text: 'Marmo Kitchen'
    //                             },
    //                             {
    //                                 type:'text',
    //                                 parameter_name: 'order_link',
    //                                 text: 'google.com'
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         })
    //     })
    //     console.log(response)
    // }
    // catch(e){
    //     console.log(e)
    // }

    return {
        statusCode: 123
    }
    
}