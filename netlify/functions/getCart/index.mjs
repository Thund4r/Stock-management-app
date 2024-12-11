import*as o from"@aws-sdk/lib-dynamodb";import*as t from"@aws-sdk/client-dynamodb";import*as e from"@aws-sdk/credential-provider-cognito-identity";import*as n from"@aws-sdk/client-cognito-identity";var r={d:(o,t)=>{for(var e in t)r.o(t,e)&&!r.o(o,e)&&Object.defineProperty(o,e,{enumerable:!0,get:t[e]})},o:(o,t)=>Object.prototype.hasOwnProperty.call(o,t)},a={};r.d(a,{R:()=>u});const i=(s={DynamoDBDocumentClient:()=>o.DynamoDBDocumentClient,QueryCommand:()=>o.QueryCommand},d={},r.d(d,s),d);var s,d;const l=(o=>{var t={};return r.d(t,o),t})({DynamoDBClient:()=>t.DynamoDBClient}),m=(o=>{var t={};return r.d(t,o),t})({fromCognitoIdentityPool:()=>e.fromCognitoIdentityPool}),y=(o=>{var t={};return r.d(t,o),t})({CognitoIdentityClient:()=>n.CognitoIdentityClient}),c=new l.DynamoDBClient({credentials:(0,m.fromCognitoIdentityPool)({client:new y.CognitoIdentityClient,identityPoolId:"us-east-1:56df3a77-0207-4112-be52-7e2171af2650"})}),C=i.DynamoDBDocumentClient.from(c,{marshallOptions:{convertEmptyValues:!1,removeUndefinedValues:!1,convertClassInstanceToMap:!1},unmarshallOptions:{wrapNumbers:!1}}),u=async o=>{payload=JSON.parse(o.body);const t={TableName:"CartDB",KeyConditionExpression:"CustomerID = :c",ExpressionAttributeValues:{":c":payload.CustomerID}};try{console.log("Getting user cart..."),console.log(t);const o=await C.send(new i.QueryCommand(t));return console.log("Retrieved cart:",o.Items),{statusCode:200,body:JSON.stringify(o.Items)}}catch(o){return console.error(o),{statusCode:500,body:JSON.stringify(o)}}};var p=a.R;export{p as handler};